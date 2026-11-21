// The index of the first comma from `from` that sits inside no bracket and lies before `to`, or -1 when there is none
export const findTopLevelComma = (code: string, from: number, to: number): number => {
  let depth = 0;
  for (let index = from; index < to; index++) {
    const character = code.charAt(index);
    if (/[([{]/u.test(character)) depth++;
    else if (/[)\]}]/u.test(character)) depth--;
    else if (character === "," && depth === 0) return index;
  }
  return -1;
};
