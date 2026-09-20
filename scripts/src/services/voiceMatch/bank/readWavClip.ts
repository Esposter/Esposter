import type { PcmClip } from "#src/models/voiceMatch/PcmClip";

import { InvalidOperationError, Operation } from "@esposter/shared";

const SAMPLE_RATE_OFFSET = 24;
const FIRST_CHUNK_OFFSET = 12;
const CHUNK_HEADER_BYTES = 8;
const CHUNK_ID_BYTES = 4;
const DATA_CHUNK_ID = "data";
const BYTES_PER_SAMPLE = 2;
const INT16_SCALE = 32_768;

// The service's 16-bit mono RIFF output as one channel of floats: the chunks are walked to the data chunk rather
// Than assumed at a fixed offset, since the header carries whatever chunks the encoder chose to write
export const readWavClip = (wav: Buffer): PcmClip => {
  const sampleRate = wav.readUInt32LE(SAMPLE_RATE_OFFSET);
  let cursor = FIRST_CHUNK_OFFSET;
  while (cursor + CHUNK_HEADER_BYTES <= wav.length) {
    const chunkId = wav.toString("ascii", cursor, cursor + CHUNK_ID_BYTES);
    const chunkSize = wav.readUInt32LE(cursor + CHUNK_ID_BYTES);
    const chunkStart = cursor + CHUNK_HEADER_BYTES;
    if (chunkId === DATA_CHUNK_ID) {
      const sampleCount = Math.min(chunkSize, wav.length - chunkStart) / BYTES_PER_SAMPLE;
      const samples = Float32Array.from(
        { length: Math.floor(sampleCount) },
        (_, index) => wav.readInt16LE(chunkStart + index * BYTES_PER_SAMPLE) / INT16_SCALE,
      );
      return { sampleRate, samples };
    }

    // A chunk is padded to an even length
    cursor = chunkStart + chunkSize + (chunkSize % 2);
  }

  throw new InvalidOperationError(Operation.Read, readWavClip.name, "no data chunk");
};
