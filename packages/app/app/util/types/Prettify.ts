import type { DigitCharacter, LowercaseLetter, Trim, UppercaseLetter } from "type-fest";

export type Prettify<T extends string> = Trim<BasePrettify<T>>;

type BasePrettify<T extends string> = T extends `${infer Start}${infer WordBoundaryCharacter}${infer Rest}`
  ? // 1. lowercase + uppercase/digit
    Start extends LowercaseLetter
    ? WordBoundaryCharacter extends DigitCharacter | UppercaseLetter
      ? `${Start} ${WordBoundaryCharacter}${BasePrettify<Rest>}`
      : `${Start}${BasePrettify<`${WordBoundaryCharacter}${Rest}`>}`
    : // 2. digit + lowercase/uppercase
      Start extends DigitCharacter
      ? WordBoundaryCharacter extends LowercaseLetter | UppercaseLetter
        ? `${Start} ${WordBoundaryCharacter}${BasePrettify<Rest>}`
        : `${Start}${BasePrettify<`${WordBoundaryCharacter}${Rest}`>}`
      : `${Start}${WordBoundaryCharacter}${BasePrettify<Rest>}`
  : T;
