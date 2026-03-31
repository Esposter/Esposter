import { Delimiter, DELIMITER_REGEX_MAP } from "#shared/models/compiler/Delimiter";

export const decompileVariables = (
  string: string,
  context: Record<string, unknown>,
  delimiter: Delimiter = Delimiter.CurlyBraces,
): string =>
  string.replaceAll(DELIMITER_REGEX_MAP[delimiter], (_, key: string) =>
    context[key] != null ? String(context[key]) : "",
  );
