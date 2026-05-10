import { Delimiter } from "#shared/models/compiler/Delimiter";
import { DelimiterCharMap } from "#shared/models/compiler/DelimiterCharMap";
import { createVariableRegex } from "#shared/services/compiler/createVariableRegex";

export const DelimiterRegexMap = {
  [Delimiter.CurlyBraces]: createVariableRegex(...DelimiterCharMap[Delimiter.CurlyBraces]),
} as const satisfies Record<Delimiter, RegExp>;
