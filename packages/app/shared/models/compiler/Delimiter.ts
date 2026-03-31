import { createVariableRegex } from "#shared/services/compiler/createVariableRegex";

export enum Delimiter {
  CurlyBraces = "CurlyBraces",
}

export const DELIMITER_CHAR_MAP: Record<Delimiter, readonly [string, string]> = {
  [Delimiter.CurlyBraces]: ["{", "}"],
};

export const DELIMITER_REGEX_MAP: Record<Delimiter, RegExp> = {
  [Delimiter.CurlyBraces]: createVariableRegex("{", "}"),
};
