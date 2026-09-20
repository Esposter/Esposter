import { readWavClip } from "#src/services/voiceMatch/bank/readWavClip";
import { describe, expect, test } from "vitest";

describe(readWavClip, () => {
  const SAMPLE_RATE = 1;
  const HEADER_BYTES = 12;
  const CHUNK_HEADER_BYTES = 8;
  const writeChunk = (wav: Buffer, offset: number, id: string, body: Buffer) => {
    wav.write(id, offset, "ascii");
    wav.writeUInt32LE(body.length, offset + 4);
    body.copy(wav, offset + CHUNK_HEADER_BYTES);
    return offset + CHUNK_HEADER_BYTES + body.length;
  };
  const getWav = (chunks: [string, Buffer][]) => {
    const wav = Buffer.alloc(
      HEADER_BYTES + chunks.reduce((sum, [, body]) => sum + CHUNK_HEADER_BYTES + body.length, 0),
    );
    wav.write("RIFF", 0, "ascii");
    wav.write("WAVE", 8, "ascii");
    let cursor = HEADER_BYTES;
    for (const [id, body] of chunks) cursor = writeChunk(wav, cursor, id, body);
    return wav;
  };

  test("walks past the format chunk to the samples and scales them to floats", () => {
    expect.hasAssertions();

    const format = Buffer.alloc(16);
    format.writeUInt32LE(SAMPLE_RATE, 4);
    const data = Buffer.alloc(4);
    data.writeInt16LE(-32_768, 0);
    data.writeInt16LE(16_384, 2);

    expect(
      readWavClip(
        getWav([
          ["fmt ", format],
          ["data", data],
        ]),
      ),
    ).toStrictEqual({ sampleRate: SAMPLE_RATE, samples: Float32Array.of(-1, 0.5) });
  });

  test("refuses a file with no data chunk", () => {
    expect.hasAssertions();

    expect(() => readWavClip(getWav([["fmt ", Buffer.alloc(16)]]))).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: readWavClip, no data chunk]`,
    );
  });
});
