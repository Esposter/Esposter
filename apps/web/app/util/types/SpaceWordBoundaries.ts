import type { DigitCharacter, LowercaseLetter, Trim, UppercaseLetter } from "type-fest";

export type SpaceWordBoundaries<T extends string> = Trim<BaseSpaceWordBoundaries<T>>;

// Every character after the first is re-checked as the next Start, so a boundary consumed by a split is still a Start
type BaseSpaceWordBoundaries<T extends string> = T extends `${infer Start}${infer Rest}`
  ? Rest extends `${infer Next}${string}`
    ? // 1. lowercase + uppercase/digit
      Start extends LowercaseLetter
      ? Next extends DigitCharacter | UppercaseLetter
        ? `${Start} ${BaseSpaceWordBoundaries<Rest>}`
        : `${Start}${BaseSpaceWordBoundaries<Rest>}`
      : // 2. digit + lowercase/uppercase
        Start extends DigitCharacter
        ? Next extends LowercaseLetter | UppercaseLetter
          ? `${Start} ${BaseSpaceWordBoundaries<Rest>}`
          : `${Start}${BaseSpaceWordBoundaries<Rest>}`
        : `${Start}${BaseSpaceWordBoundaries<Rest>}`
    : T
  : T;
