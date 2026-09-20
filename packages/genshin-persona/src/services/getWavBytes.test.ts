import { getWavBytes } from "#src/services/getWavBytes";
import { describe, expect, test } from "vitest";

describe(getWavBytes, () => {
  test("writes a 16-bit mono header and clamps the samples", () => {
    expect.hasAssertions();

    const bytes = getWavBytes({ sampleRate: 1, samples: Float32Array.of(0, 2, -1) });
    const buffer = Buffer.from(bytes);

    expect(buffer.toString("ascii", 0, 4)).toBe("RIFF");
    expect(buffer.toString("ascii", 8, 12)).toBe("WAVE");
    expect(buffer.readUInt16LE(22)).toBe(1);
    expect(buffer.readUInt32LE(24)).toBe(1);
    expect(buffer.readUInt16LE(34)).toBe(16);
    expect(buffer.readUInt32LE(40)).toBe(6);
    expect([buffer.readInt16LE(44), buffer.readInt16LE(46), buffer.readInt16LE(48)]).toStrictEqual([
      0, 32_767, -32_767,
    ]);
  });
});
