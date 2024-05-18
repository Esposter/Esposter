import type { Trim } from "type-fest";
import type { UpperCaseToLowerCase } from "type-fest/source/delimiter-case";
import type { UpperCaseCharacters } from "type-fest/source/internal";

type BasePrettifyName<T extends string> = T extends `${infer Start}${infer UpperCaseCharacter}${infer Rest}`
  ? Start extends UpperCaseToLowerCase<UpperCaseCharacters>
    ? UpperCaseCharacter extends UpperCaseCharacters
      ? `${Start} ${UpperCaseCharacter}${BasePrettifyName<Rest>}`
      : `${Start}${BasePrettifyName<`${UpperCaseCharacter}${Rest}`>}`
    : `${Start}${UpperCaseCharacter}${BasePrettifyName<Rest>}`
  : T;

export type PrettifyName<T extends string> = Trim<BasePrettifyName<T>>;
