// A clip's curves as AnimeStudio exports them, which the export nests one level deeper in some builds. A clip whose
// Curves are ACL-compressed carries them in `m_ACLClip` instead, its streamed, dense and constant parts left empty
export interface ExportedClipData {
  m_ACLClip?: { IsSet: boolean };
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
