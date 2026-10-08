// A body type's locomotion clip as AnimeStudio exports it, as far as its root's motion is read: its Mecanim clip's span,
// The root's place at its start and its stop, and the root's average velocity, which the export writes as "NaN" for a
// Clip whose root does not move
export interface ExportedLocomotionClip {
  m_MuscleClip: {
    m_AverageSpeed: { X: number | string; Y: number | string; Z: number | string };
    m_StartTime: number;
    m_StartX: { t: { X: number; Y: number; Z: number } };
    m_StopTime: number;
    m_StopX: { t: { X: number; Y: number; Z: number } };
  };
  m_Name: string;
}
