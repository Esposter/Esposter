// Whether every word of the first set is in the second
export const checkIsWordSubset = (words: ReadonlySet<string>, others: ReadonlySet<string>): boolean =>
  [...words].every((word) => others.has(word));
