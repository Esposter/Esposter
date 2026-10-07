import { computeUnderBlackShare } from "#src/services/genshinParity/display/computeUnderBlackShare";
import { describe, expect, test } from "vitest";

describe(computeUnderBlackShare, () => {
  test("counts each channel's pixels under the curve's black apart", () => {
    expect.hasAssertions();

    const { blackByte } = computeUnderBlackShare(Buffer.alloc(0));
    const { channelShares } = computeUnderBlackShare(Buffer.from([blackByte - 1, blackByte, blackByte]));

    expect(channelShares).toStrictEqual([1, 0, 0]);
  });

  test("counts the pixels with a channel under the curve's black, leaving a letterbox out", () => {
    expect.hasAssertions();

    const { blackByte } = computeUnderBlackShare(Buffer.alloc(0));
    const { share } = computeUnderBlackShare(
      Buffer.from([0, 0, 0, blackByte - 1, blackByte, blackByte, blackByte, blackByte, blackByte]),
    );

    expect(share).toBe(0.5);
  });
});
