import { Delimiter } from "#shared/models/compiler/Delimiter";
import { DelimiterRegexMap } from "#shared/models/compiler/DelimiterRegexMap";

export const decompileVariables = (
  string: string,
  context: Record<string, boolean | null | number | string | undefined>,
  delimiter: Delimiter = Delimiter.CurlyBraces,
): string =>
  string.replaceAll(DelimiterRegexMap[delimiter], (_, key: string) => {
    if (!Object.hasOwn(context, key)) return "";
    const value = context[key];
    return value !== null && value !== undefined ? String(value) : "";
  });
