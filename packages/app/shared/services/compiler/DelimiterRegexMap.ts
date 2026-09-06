import { Delimiter } from "#shared/models/compiler/Delimiter";
import { createVariableRegex } from "#shared/services/compiler/createVariableRegex";
import { DelimiterCharacterMap } from "#shared/services/compiler/DelimiterCharacterMap";

export const DelimiterRegexMap = {
  [Delimiter.CurlyBraces]: createVariableRegex(...DelimiterCharacterMap[Delimiter.CurlyBraces]),
} as const satisfies Record<Delimiter, RegExp>;
