import { NormalizeStringMode } from "@/models/tableEditor/file/NormalizeStringMode";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const applyNormalizeStringMode = (value: string, mode: NormalizeStringMode): string => {
  if (mode === NormalizeStringMode.Trim) return value.trim();
  if (mode === NormalizeStringMode.Lowercase) return value.toLowerCase();
  if (mode === NormalizeStringMode.Uppercase) return value.toUpperCase();
  if (mode === NormalizeStringMode.TitleCase)
    return value.toLowerCase().replaceAll(/(?:^|\s)\S/g, (char) => char.toUpperCase());
  throw new InvalidOperationError(Operation.Update, applyNormalizeStringMode.name, `Unknown mode: ${mode}`);
};
