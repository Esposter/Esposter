import type { PcmClip } from "#src/models/voiceMatch/PcmClip";

import { InvalidOperationError, Operation } from "@esposter/shared";

const FIRST_CHUNK_OFFSET = 12;
const CHUNK_HEADER_BYTES = 8;
const CHUNK_ID_BYTES = 4;
const FORMAT_CHUNK_ID = "fmt ";
const DATA_CHUNK_ID = "data";
// Into the format chunk's body: past the format tag and the channel count
const SAMPLE_RATE_OFFSET = 4;
const BYTES_PER_SAMPLE = 2;
const INT16_SCALE = 32_768;

// The service's 16-bit mono RIFF output as one channel of floats: the chunks are walked for the format and the data
// Rather than assumed at fixed offsets, since the header carries whatever chunks the encoder chose to write
export const readWavClip = (wav: Buffer): PcmClip => {
  let sampleRate = 0;
  let cursor = FIRST_CHUNK_OFFSET;
  while (cursor + CHUNK_HEADER_BYTES <= wav.length) {
    const chunkId = wav.toString("ascii", cursor, cursor + CHUNK_ID_BYTES);
    const chunkSize = wav.readUInt32LE(cursor + CHUNK_ID_BYTES);
    const chunkStart = cursor + CHUNK_HEADER_BYTES;
    if (chunkId === FORMAT_CHUNK_ID) sampleRate = wav.readUInt32LE(chunkStart + SAMPLE_RATE_OFFSET);
    else if (chunkId === DATA_CHUNK_ID) {
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
