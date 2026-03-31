import { Delimiter, DELIMITER_CHAR_MAP } from "#shared/models/compiler/Delimiter";

export const compileVariable = (key: string, delimiter: Delimiter = Delimiter.CurlyBraces): string => {
  const [open, close] = DELIMITER_CHAR_MAP[delimiter];
  return `${open}${key}${close}`;
};
