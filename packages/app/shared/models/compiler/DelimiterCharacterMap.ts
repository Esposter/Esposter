import { Delimiter } from "#shared/models/compiler/Delimiter";

export const DelimiterCharacterMap = {
  [Delimiter.CurlyBraces]: ["{", "}"],
} as const satisfies Record<Delimiter, readonly [string, string]>;
