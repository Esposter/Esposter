import { mixDownChannels } from "#src/services/mixDownChannels";
import { describe, expect, test } from "vitest";

describe(mixDownChannels, () => {
  const left = new Float32Array([1, 0]);
  const right = new Float32Array([0, 1]);

  test("#9 averages a stereo recording's channels", () => {
    expect.hasAssertions();

    const audio = {
      getChannelData: (channel: number) => (channel === 0 ? left : right),
      numberOfChannels: 2,
      sampleRate: 22050,
    };

    expect(mixDownChannels(audio)).toStrictEqual(new Float32Array([0.5, 0.5]));
  });

  test("refuses a recording at another sample rate", () => {
    expect.hasAssertions();

    const audio = { getChannelData: () => left, numberOfChannels: 1, sampleRate: 1 };

    expect(() => mixDownChannels(audio)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: mixDownChannels, audio at 1 Hz, the model reads 22050 Hz]`,
    );
  });
});
