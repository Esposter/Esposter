// The Unity property names a clip's bindings are matched against by CRC32: a CanvasGroup's alpha, a GameObject's being
// Active, a Behaviour's being enabled, a Graphic's colour, and a RectTransform's layout, each component its own name
export const UnityPropertyNames = [
  "m_Alpha",
  "m_IsActive",
  "m_Enabled",
  "m_Color.r",
  "m_Color.g",
  "m_Color.b",
  "m_Color.a",
  "m_FillAmount",
  "m_AnchoredPosition.x",
  "m_AnchoredPosition.y",
  "m_SizeDelta.x",
  "m_SizeDelta.y",
  "m_AnchorMin.x",
  "m_AnchorMin.y",
  "m_AnchorMax.x",
  "m_AnchorMax.y",
  "m_Pivot.x",
  "m_Pivot.y",
] as const;
