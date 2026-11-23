// The wavelength a detail family's normal detail is fitted at: the frame's own lobe where the frame resolves one, and
// The family's normal map's only where it resolves none (design.md, Decisions). `isFromTexture` says which one it is
export const chooseDetailWavelength = ({
  frame,
  texture,
}: {
  frame?: number | undefined;
  texture?: number | undefined;
}): { isFromTexture: boolean; metres: number } | undefined => {
  if (frame !== undefined) return { isFromTexture: false, metres: frame };
  if (texture !== undefined) return { isFromTexture: true, metres: texture };
  return undefined;
};
