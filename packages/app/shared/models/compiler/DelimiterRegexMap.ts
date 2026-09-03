import { Delimiter } from "#shared/models/compiler/Delimiter";
import { DelimiterCharacterMap } from "#shared/models/compiler/DelimiterCharacterMap";
import { createVariableRegex } from "#shared/services/compiler/createVariableRegex";

export const DelimiterRegexMap = {
  [Delimiter.CurlyBraces]: createVariableRegex(...DelimiterCharacterMap[Delimiter.CurlyBraces]),
} as const satisfies Record<Delimiter, RegExp>;
