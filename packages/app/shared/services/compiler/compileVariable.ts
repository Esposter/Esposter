import { Delimiter } from "#shared/models/compiler/Delimiter";
import { DelimiterCharMap } from "#shared/models/compiler/DelimiterCharMap";

export const compileVariable = (key: string, delimiter: Delimiter = Delimiter.CurlyBraces): string => {
  const [open, close] = DelimiterCharMap[delimiter];
  return `${open}${key}${close}`;
};
