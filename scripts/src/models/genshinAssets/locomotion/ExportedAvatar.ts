// A character's avatar as AnimeStudio exports it, as far as its human scale is read: the height of the body's centre in
// Its T-pose, in metres, which Mecanim multiplies a humanoid clip's root motion by out of its normalised space
export interface ExportedAvatar {
  m_Avatar: { m_Human: { m_Scale: number } };
}
