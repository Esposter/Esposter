import type { DigitCharacter, LowercaseLetter, Trim, UppercaseLetter } from "type-fest";

export type SpaceWordBoundaries<T extends string> = Trim<BaseSpaceWordBoundaries<T>>;

type BaseSpaceWordBoundaries<T extends string> = T extends `${infer Start}${infer WordBoundaryCharacter}${infer Rest}`
  ? // 1. lowercase + uppercase/digit
    Start extends LowercaseLetter
    ? WordBoundaryCharacter extends DigitCharacter | UppercaseLetter
      ? `${Start} ${WordBoundaryCharacter}${BaseSpaceWordBoundaries<Rest>}`
      : `${Start}${BaseSpaceWordBoundaries<`${WordBoundaryCharacter}${Rest}`>}`
    : // 2. digit + lowercase/uppercase
      Start extends DigitCharacter
      ? WordBoundaryCharacter extends LowercaseLetter | UppercaseLetter
        ? `${Start} ${WordBoundaryCharacter}${BaseSpaceWordBoundaries<Rest>}`
        : `${Start}${BaseSpaceWordBoundaries<`${WordBoundaryCharacter}${Rest}`>}`
      : `${Start}${WordBoundaryCharacter}${BaseSpaceWordBoundaries<Rest>}`
  : T;
