import { Delimiter } from "#shared/models/compiler/Delimiter";

export const DelimiterCharMap = {
  [Delimiter.CurlyBraces]: ["{", "}"],
} as const satisfies Record<Delimiter, readonly [string, string]>;
