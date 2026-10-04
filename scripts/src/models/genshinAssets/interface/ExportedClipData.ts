// A clip's curves as AnimeStudio exports them, which the export nests one level deeper in some builds
export interface ExportedClipData {
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
