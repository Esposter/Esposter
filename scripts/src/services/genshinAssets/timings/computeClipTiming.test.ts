import type { ExportedClipTiming } from "#src/models/genshinAssets/timings/ExportedClipTiming";

import { computeClipTiming } from "#src/services/genshinAssets/timings/computeClipTiming";
import { describe, expect, test } from "vitest";

describe(computeClipTiming, () => {
  test("reads the seconds from the clip's start to its stop, and keeps each event at the second it fires", () => {
    expect.hasAssertions();

    const clip: ExportedClipTiming = {
      m_Events: [{ functionName: "Hit", time: 2 }],
      m_MuscleClip: { m_StartTime: 1, m_StopTime: 3 },
      m_Name: "",
    };

    expect(computeClipTiming(clip)).toStrictEqual({
      duration: 2,
      events: [{ functionName: "Hit", time: 2 }],
      name: "",
    });
  });
});
