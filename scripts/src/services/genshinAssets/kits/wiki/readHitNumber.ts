const HIT_NUMBER_REGEX = /\b(?<number>\d+)-hit\b/iu;

// The number of a text's `N-Hit` word, `3` for `Normal Attack 3-Hit A`, or undefined where the text has none
export const readHitNumber = (text: string): number | undefined => {
  const number = HIT_NUMBER_REGEX.exec(text)?.groups?.number;
  return number === undefined ? undefined : Number(number);
};
