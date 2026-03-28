import { StringTransformationType } from "#shared/models/tableEditor/file/column/transformation/StringTransformationType";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const applyStringTransformation = (value: string, transform: StringTransformationType): string => {
  if (transform === StringTransformationType.Trim) return value.trim();
  if (transform === StringTransformationType.Lowercase) return value.toLowerCase();
  if (transform === StringTransformationType.Uppercase) return value.toUpperCase();
  if (transform === StringTransformationType.TitleCase)
    return value.toLowerCase().replaceAll(/(?:^|\s)\S/g, (char) => char.toUpperCase());
  throw new InvalidOperationError(Operation.Update, applyStringTransformation.name, `Unknown transform: ${transform}`);
};
