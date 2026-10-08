// The key a placement's 64-bit path hash names its asset by in the community index: the PathHashLast in the four bytes
// Above the low byte, PathHashPre, with the bits past those five bytes dropped, as `readAssetPathNames` keys them
export const getPathHashKey = (pathHash: string): string => {
  const hash = BigInt(pathHash);
  return String((((hash >> 8n) & 0xff_ff_ff_ffn) << 8n) | (hash & 0xffn));
};
