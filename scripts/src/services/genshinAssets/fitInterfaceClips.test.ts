import type { DecodedCurve } from "#src/models/genshinAssets/DecodedCurve";

import { fitInterfaceClips } from "#src/services/genshinAssets/fitInterfaceClips";
import { describe, expect, test } from "vitest";

const createCurve = (path: string, property: string, samples: number[]): DecodedCurve => ({
  component: "",
  path,
  property,
  samples,
  type: "",
});

describe(fitInterfaceClips, () => {
  test("keeps a moving curve on a named piece as keyframes where it bends, and leaves out hashes and held curves", () => {
    expect.hasAssertions();

    const clips = [
      {
        curves: [
          createCurve("Bottom", "m_Alpha", [0, 0.5, 1, 1, 1]),
          createCurve("12345", "m_Alpha", [0, 1, 1, 1, 1]),
          createCurve("Center", "m_Alpha", [1, 1, 1, 1, 1]),
        ],
        duration: 1,
        name: "FadeIn",
      },
    ];

    expect(fitInterfaceClips(clips)).toStrictEqual({
      FadeIn: {
        durationMs: 1000,
        tracks: [
          {
            keyframes: [
              [0, 0],
              [0.5, 1],
              [1, 1],
            ],
            property: "opacity",
            target: "Bottom",
          },
        ],
      },
    });
  });
});
