import type { ExportedAnimationClip } from "#src/models/genshinAssets/interface/ExportedAnimationClip";
import type { DecodedCurve } from "#src/models/genshinAssets/shared/DecodedCurve";

import { evaluateStreamedCurve } from "#src/services/genshinAssets/interface/evaluateStreamedCurve";
import { parseStreamedClipKeys } from "#src/services/genshinAssets/interface/parseStreamedClipKeys";

// A Transform's properties by the attribute its binding names them with, and the components each takes one curve for
const TransformPropertyMap: Record<number, { components: string[]; property: string }> = {
  1: { components: ["x", "y", "z"], property: "position" },
  2: { components: ["x", "y", "z", "w"], property: "rotation" },
  3: { components: ["x", "y", "z"], property: "scale" },
  4: { components: ["x", "y", "z"], property: "euler" },
};
// A clip decoded into curves sampled at the rate given over its span: its bindings expanded into one curve a component
// (a Transform's position, rotation, scale or Euler angles taking a curve each), numbered across its streamed, dense
// And constant curves in that order. A property or path is named by `resolveName` where its CRC32 resolves
export const decodeAnimationClip = (
  clip: ExportedAnimationClip,
  sampleRate: number,
  resolveName: (hash: number) => string,
): { curves: DecodedCurve[]; duration: number } => {
  const { m_Clip, m_StartTime, m_StopTime } = clip.m_MuscleClip;
  const { m_ConstantClip, m_DenseClip, m_StreamedClip } = "data" in m_Clip ? m_Clip.data : m_Clip;
  const duration = m_StopTime - m_StartTime;
  const sampleCount = Math.max(Math.round(duration * sampleRate), 0) + 1;
  const times = Array.from({ length: sampleCount }, (_, index) => m_StartTime + index / sampleRate);
  const streamedKeys = parseStreamedClipKeys(m_StreamedClip.data);
  const streamedCount = m_StreamedClip.curveCount;
  const denseCount = m_DenseClip.m_CurveCount;
  const sampleCurve = (index: number): number[] => {
    if (index < streamedCount) return times.map((time) => evaluateStreamedCurve(streamedKeys.get(index) ?? [], time));
    if (index < streamedCount + denseCount) {
      const denseIndex = index - streamedCount;
      return times.map((time) => {
        const frame = Math.min(
          Math.max(Math.round((time - m_DenseClip.m_BeginTime) * m_DenseClip.m_SampleRate), 0),
          m_DenseClip.m_FrameCount - 1,
        );
        return m_DenseClip.m_SampleArray[frame * denseCount + denseIndex] ?? 0;
      });
    }
    const value = m_ConstantClip.data[index - streamedCount - denseCount] ?? 0;
    return times.map(() => value);
  };
  const curves: DecodedCurve[] = [];
  for (const { attribute, path, typeID } of clip.m_ClipBindingConstant.genericBindings) {
    const transformProperty = typeID === "Transform" ? TransformPropertyMap[attribute] : undefined;
    const components = transformProperty?.components ?? [""];
    const property = transformProperty?.property ?? resolveName(attribute);
    for (const component of components)
      curves.push({ component, path: resolveName(path), property, samples: sampleCurve(curves.length), type: typeID });
  }
  return { curves, duration };
};
