// An animation clip as AnimeStudio exports it, as far as its curves are read: its Mecanim clip's streamed, dense and
// Constant curves and its span, and its bindings, each an object's path and a property by CRC32 (a Transform's by 1
// For position, 2 rotation, 3 scale and 4 Euler angles)
export interface ExportedAnimationClip {
  m_ClipBindingConstant: { genericBindings: { attribute: number; path: number; typeID: string }[] };
  m_MuscleClip: { m_Clip: ClipData | { data: ClipData }; m_StartTime: number; m_StopTime: number };
  m_Name: string;
}
// A clip's curves, which the export nests one level deeper in some builds
interface ClipData {
  m_ConstantClip: { data: number[] };
  m_DenseClip: {
    m_BeginTime: number;
    m_CurveCount: number;
    m_FrameCount: number;
    m_SampleArray: number[];
    m_SampleRate: number;
  };
  m_StreamedClip: { curveCount: number; data: number[] };
}
