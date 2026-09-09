import { Delimiter } from "#shared/models/compiler/Delimiter";
import { DelimiterRegexMap } from "#shared/services/compiler/DelimiterRegexMap";

export const decompileVariables = (
  string: string,
  context: Record<string, boolean | null | number | string | undefined>,
  delimiter: Delimiter = Delimiter.CurlyBraces,
): string =>
  string.replaceAll(DelimiterRegexMap[delimiter], (_, key: string) => {
    // Own keys only — an inherited name like `toString` would otherwise substitute the function's source
    if (Object.hasOwn(context, key)) return String(context[key] ?? "");
    else return "";
  });
