// Two strings are compared one code unit at a time through to the end.
// So the time taken does not show how long a prefix matched.
// A length difference is still visible, which a password's length is allowed to be
export const checkIsEqualInConstantTime = (first: string, second: string): boolean => {
  const firstBytes = new TextEncoder().encode(first);
  const secondBytes = new TextEncoder().encode(second);
  if (firstBytes.length !== secondBytes.length) return false;

  let difference = 0;
  for (const [index, byte] of firstBytes.entries()) difference |= byte ^ (secondBytes[index] ?? 0);
  return difference === 0;
};
