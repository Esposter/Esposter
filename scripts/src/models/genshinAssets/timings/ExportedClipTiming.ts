import type { ClipEvent } from "#src/models/genshinAssets/timings/ClipEvent";

// An animation clip as AnimeStudio exports it, as far as its timing is read: its Mecanim clip's span from its start to
// Its stop, and the events its animation fires along that span
export interface ExportedClipTiming {
  m_Events: ClipEvent[];
  m_MuscleClip: { m_StartTime: number; m_StopTime: number };
  m_Name: string;
}
