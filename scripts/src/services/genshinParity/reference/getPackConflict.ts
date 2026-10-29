// Why a scratch screenshot cannot be held as its committed file: the committed file has no manifest row, or its row names
// Other bytes than the screenshot packs to. Undefined when the two agree, so the committed file is held as it is
export const getPackConflict = (
  file: string,
  packedSha256: string,
  committedSha256: string | undefined,
): string | undefined => {
  if (committedSha256 === packedSha256) return undefined;
  if (committedSha256 === undefined) return `${file} is committed with no manifest row`;
  return `${file} packs to ${packedSha256}, but its committed row says ${committedSha256}`;
};
