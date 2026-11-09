// The index of the bracket closing the one at openIndex, counting every kind of bracket alike, or -1 when none closes it
export const findClosingBracket = (code: string, openIndex: number): number => {
  let depth = 0;
  for (let index = openIndex; index < code.length; index++) {
    const character = code.charAt(index);
    if (/[([{]/u.test(character)) depth++;
    else if (/[)\]}]/u.test(character)) {
      depth--;
      if (depth === 0) return index;
    }
  }
  return -1;
};
