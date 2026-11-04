// The last code point of the basic plane: a point past it is a surrogate pair of two code units
const BASIC_PLANE_LAST_CODE_POINT = 0xffff;

// Two texts compare by code point, so a character past the basic plane sorts after every character in it, where UTF-16
// Code units would sort it among the surrogates. Each text is walked by its code points, so nothing is copied to compare
// Them. The result has the sign a sort takes
export const compareSurveyLogicTexts = (first: string, second: string): number => {
  let firstIndex = 0;
  let secondIndex = 0;
  while (firstIndex < first.length && secondIndex < second.length) {
    const firstPoint = first.codePointAt(firstIndex) ?? 0;
    const secondPoint = second.codePointAt(secondIndex) ?? 0;
    if (firstPoint !== secondPoint) return firstPoint < secondPoint ? -1 : 1;

    firstIndex += firstPoint > BASIC_PLANE_LAST_CODE_POINT ? 2 : 1;
    secondIndex += secondPoint > BASIC_PLANE_LAST_CODE_POINT ? 2 : 1;
  }
  if (firstIndex < first.length) return 1;

  return secondIndex < second.length ? -1 : 0;
};
