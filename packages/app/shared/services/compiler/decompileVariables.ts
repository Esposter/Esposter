import { Delimiter } from "#shared/models/compiler/Delimiter";
import { DelimiterRegexMap } from "#shared/models/compiler/DelimiterRegexMap";

export const decompileVariables = (
  string: string,
  context: Record<string, unknown>,
  delimiter: Delimiter = Delimiter.CurlyBraces,
): string =>
  string.replaceAll(DelimiterRegexMap[delimiter], (_, key: keyof typeof context) =>
    context[key] !== null && context[key] !== undefined ? String(context[key]) : "",
  );
