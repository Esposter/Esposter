import type { PcmClip } from "#src/models/PcmClip";

// The RIFF header's fixed layout: the chunk ids and sizes, the format chunk of a 16-bit mono PCM stream
const HEADER_BYTES = 44;
const FORMAT_CHUNK_BYTES = 16;
const PCM_FORMAT = 1;
const CHANNELS = 1;
const BYTES_PER_SAMPLE = 2;
const BITS_PER_SAMPLE = 16;
const INT16_MAX = 0x7f_ff;
// A WAV the stock player of every desktop opens without a codec, from the engine's float samples
export const getWavBytes = ({ sampleRate, samples }: PcmClip): Uint8Array => {
  const buffer = Buffer.alloc(HEADER_BYTES + samples.length * BYTES_PER_SAMPLE);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(buffer.length - 8, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(FORMAT_CHUNK_BYTES, 16);
  buffer.writeUInt16LE(PCM_FORMAT, 20);
  buffer.writeUInt16LE(CHANNELS, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * CHANNELS * BYTES_PER_SAMPLE, 28);
  buffer.writeUInt16LE(CHANNELS * BYTES_PER_SAMPLE, 32);
  buffer.writeUInt16LE(BITS_PER_SAMPLE, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(samples.length * BYTES_PER_SAMPLE, 40);
  for (const [index, sample] of samples.entries())
    buffer.writeInt16LE(
      Math.round(Math.max(-1, Math.min(1, sample)) * INT16_MAX),
      HEADER_BYTES + index * BYTES_PER_SAMPLE,
    );
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length);
};
