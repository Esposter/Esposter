import type { ExportedLocomotionClip } from "#src/models/genshinAssets/locomotion/ExportedLocomotionClip";
import type { LocomotionClipReading } from "#src/models/genshinAssets/locomotion/LocomotionClipReading";

// A clip's root motion read off where its root starts and stops over its span, beside the average velocity the clip
// Records, the ground being the plane across Unity's x and z
export const computeLocomotionClipReading = ({
  m_MuscleClip,
  m_Name,
}: ExportedLocomotionClip): LocomotionClipReading => {
  const { m_AverageSpeed, m_StartTime, m_StartX, m_StopTime, m_StopX } = m_MuscleClip;
  const duration = m_StopTime - m_StartTime;
  const groundDistance = Math.hypot(m_StopX.t.X - m_StartX.t.X, m_StopX.t.Z - m_StartX.t.Z);
  return {
    averageGroundSpeed: Math.hypot(Number(m_AverageSpeed.X), Number(m_AverageSpeed.Z)),
    duration,
    groundDistance,
    groundSpeed: duration > 0 ? groundDistance / duration : 0,
    name: m_Name,
    rise: m_StopX.t.Y - m_StartX.t.Y,
  };
};
