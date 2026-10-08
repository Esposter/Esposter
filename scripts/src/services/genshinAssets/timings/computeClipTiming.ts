import type { ClipTiming } from "#src/models/genshinAssets/timings/ClipTiming";
import type { ExportedClipTiming } from "#src/models/genshinAssets/timings/ExportedClipTiming";

// A clip's timing read off its span, which runs from its start to its stop, and the events it fires along it, each kept
// At the second it fires
export const computeClipTiming = ({ m_Events, m_MuscleClip, m_Name }: ExportedClipTiming): ClipTiming => {
  const { m_StartTime, m_StopTime } = m_MuscleClip;
  return {
    duration: m_StopTime - m_StartTime,
    events: m_Events.map(({ functionName, time }) => ({ functionName, time })),
    name: m_Name,
  };
};
