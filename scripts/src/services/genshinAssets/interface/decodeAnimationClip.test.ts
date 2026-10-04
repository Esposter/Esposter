import type { ExportedAnimationClip } from "#src/models/genshinAssets/interface/ExportedAnimationClip";

import { decodeAnimationClip } from "#src/services/genshinAssets/interface/decodeAnimationClip";
import { describe, expect, test } from "vitest";

describe(decodeAnimationClip, () => {
  test("numbers curves across the dense and constant parts in binding order, a Transform's scale taking three", () => {
    expect.hasAssertions();

    const clip: ExportedAnimationClip = {
      m_ClipBindingConstant: {
        genericBindings: [
          { attribute: 3, path: 0, typeID: "Transform" },
          { attribute: 1, path: 7, typeID: "CanvasGroup" },
        ],
      },
      m_MuscleClip: {
        m_Clip: {
          m_ConstantClip: { data: [1, 1, 1] },
          m_DenseClip: { m_BeginTime: 0, m_CurveCount: 1, m_FrameCount: 2, m_SampleArray: [2, 3], m_SampleRate: 1 },
          m_StreamedClip: { curveCount: 0, data: [] },
        },
        m_StartTime: 0,
        m_StopTime: 1,
      },
      m_Name: "",
    };

    expect(decodeAnimationClip(clip, 1, (hash) => (hash === 1 ? "m_Alpha" : String(hash))).curves).toStrictEqual([
      { component: "x", path: "0", property: "scale", samples: [2, 3], type: "Transform" },
      { component: "y", path: "0", property: "scale", samples: [1, 1], type: "Transform" },
      { component: "z", path: "0", property: "scale", samples: [1, 1], type: "Transform" },
      { component: "", path: "7", property: "m_Alpha", samples: [1, 1], type: "CanvasGroup" },
    ]);
  });
});
