import type { ExportedLocomotionClip } from "#src/models/genshinAssets/locomotion/ExportedLocomotionClip";

import { computeLocomotionClipReading } from "#src/services/genshinAssets/locomotion/computeLocomotionClipReading";
import { describe, expect, test } from "vitest";

describe(computeLocomotionClipReading, () => {
  test("reads the root's distance across the ground, its rise and its speed off where it starts and stops", () => {
    expect.hasAssertions();

    const clip: ExportedLocomotionClip = {
      m_MuscleClip: {
        m_AverageSpeed: { X: "NaN", Y: "NaN", Z: "NaN" },
        m_StartTime: 0,
        m_StartX: { t: { X: 0, Y: 0, Z: 0 } },
        m_StopTime: 2,
        m_StopX: { t: { X: 3, Y: 1, Z: 4 } },
      },
      m_Name: "",
    };

    expect(computeLocomotionClipReading(clip)).toStrictEqual({
      averageGroundSpeed: Number.NaN,
      duration: 2,
      groundDistance: 5,
      groundSpeed: 2.5,
      name: "",
      rise: 1,
    });
  });
});
