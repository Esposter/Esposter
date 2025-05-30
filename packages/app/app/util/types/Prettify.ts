import type { UpperCaseToLowerCase } from "@/util/types/UpperCaseToLowerCase";
import type { Trim } from "type-fest";
import type { StringDigit, UpperCaseCharacters } from "type-fest/source/internal";

export type Prettify<T extends string> = Trim<BasePrettify<T>>;

type BasePrettify<T extends string> = T extends `${infer Start}${infer WordBoundaryCharacter}${infer Rest}`
  ? // 1. lowercase + uppercase/digit
    Start extends UpperCaseToLowerCase<UpperCaseCharacters>
    ? WordBoundaryCharacter extends StringDigit | UpperCaseCharacters
      ? `${Start} ${WordBoundaryCharacter}${BasePrettify<Rest>}`
      : `${Start}${BasePrettify<`${WordBoundaryCharacter}${Rest}`>}`
    : // 2. digit + lowercase/uppercase
      Start extends StringDigit
      ? WordBoundaryCharacter extends UpperCaseCharacters | UpperCaseToLowerCase<UpperCaseCharacters>
        ? `${Start} ${WordBoundaryCharacter}${BasePrettify<Rest>}`
        : `${Start}${BasePrettify<`${WordBoundaryCharacter}${Rest}`>}`
      : `${Start}${WordBoundaryCharacter}${BasePrettify<Rest>}`
  : T;
