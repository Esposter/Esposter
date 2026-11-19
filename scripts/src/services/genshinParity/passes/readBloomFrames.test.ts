import { BloomResize } from "#src/models/genshinParity/passes/BloomResize";
import { BLOOM_RESIZE, DISPLAY_WIDTH } from "#src/services/genshinParity/passes/constants";
import { getBloomPageWidth } from "#src/services/genshinParity/passes/readBloomFrames";
import { describe, expect, it } from "vitest";

describe(getBloomPageWidth, () => {
  it("draws both sides at the reference's own width when they are resized, so one kernel resizes both", () => {
    expect(getBloomPageWidth(BloomResize.Source, 3440)).toBe(3440);
  });

  it("draws at the display width when a frame is not resized", () => {
    expect(getBloomPageWidth(BloomResize.Display, 3440)).toBe(DISPLAY_WIDTH);
  });

  it("draws the pass's frames at the reference's own width", () => {
    expect(getBloomPageWidth(BLOOM_RESIZE, 1920)).toBe(1920);
  });
});
