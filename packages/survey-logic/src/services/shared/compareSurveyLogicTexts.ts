// Two texts compare by code point, so a character past the basic plane sorts after every character in it, where UTF-16
// Code units would sort it among the surrogates. The result has the sign a sort takes
export const compareSurveyLogicTexts = (first: string, second: string): number => {
  const firstPoints = Array.from(first, (character) => character.codePointAt(0) ?? 0);
  const secondPoints = Array.from(second, (character) => character.codePointAt(0) ?? 0);
  for (const [index, point] of firstPoints.entries()) {
    const otherPoint = secondPoints.at(index);
    if (otherPoint === undefined) return 1;
    if (point !== otherPoint) return point < otherPoint ? -1 : 1;
  }

  return firstPoints.length === secondPoints.length ? 0 : -1;
};
