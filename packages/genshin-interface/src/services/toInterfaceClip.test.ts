import { InterfaceClipProperty } from "#src/models/InterfaceClipProperty";
import { toInterfaceClip } from "#src/services/toInterfaceClip";
import { describe, expect, test } from "vitest";

describe(toInterfaceClip, () => {
  test("reads a fitted clip's tracks, dropping one whose property no screen draws", () => {
    expect.hasAssertions();

    const clip = toInterfaceClip({
      durationMs: 1,
      tracks: [
        { keyframes: [[0, 1]], property: "opacity", target: "Bottom" },
        { keyframes: [[0, 1]], property: "width", target: "Bottom" },
      ],
    });

    expect(clip).toStrictEqual({
      durationMs: 1,
      tracks: [{ keyframes: [[0, 1]], property: InterfaceClipProperty.Opacity, target: "Bottom" }],
    });
  });
});
