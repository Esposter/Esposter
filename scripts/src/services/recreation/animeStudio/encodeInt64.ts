export const encodeInt64 = (value: number): Buffer => {
  const bytes = Buffer.alloc(8);
  bytes.writeBigInt64LE(BigInt(value));
  return bytes;
};
