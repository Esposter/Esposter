import { type Trim } from "type-fest";
import { type UpperCaseCharacters } from "type-fest/source/internal";

export type PrettifyName<T extends string> = Trim<
  T extends `${infer Start}${infer UpperCaseCharacter}${infer Rest}`
    ? UpperCaseCharacter extends UpperCaseCharacters
      ? `${Start} ${UpperCaseCharacter}${PrettifyName<Rest>}`
      : `${Start}${UpperCaseCharacter}${PrettifyName<Rest>}`
    : T
>;
