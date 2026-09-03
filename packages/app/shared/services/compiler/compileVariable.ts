import { Delimiter } from "#shared/models/compiler/Delimiter";
import { DelimiterCharacterMap } from "#shared/models/compiler/DelimiterCharacterMap";

export const compileVariable = (key: string, delimiter: Delimiter = Delimiter.CurlyBraces): string => {
  const [open, close] = DelimiterCharacterMap[delimiter];
  return `${open}${key}${close}`;
};
