// Compares the presented secret with the configured one without reading either's contents by position: every byte is folded
// into one difference before the answer is read, and a length mismatch counts too
export const checkIsSecretEqual = (presented: string, expected: string): boolean => {
  const presentedBytes = new TextEncoder().encode(presented);
  const expectedBytes = new TextEncoder().encode(expected);
  let difference = presentedBytes.length ^ expectedBytes.length;
  for (let index = 0; index < Math.max(presentedBytes.length, expectedBytes.length); index += 1)
    difference |= (presentedBytes[index] ?? 0) ^ (expectedBytes[index] ?? 0);
  return difference === 0;
};
