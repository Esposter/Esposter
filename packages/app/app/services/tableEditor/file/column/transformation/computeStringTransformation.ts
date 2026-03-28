import type { StringTransformation } from "#shared/models/tableEditor/file/column/transformation/StringTransformation";

import { StringTransformationType } from "#shared/models/tableEditor/file/column/transformation/StringTransformationType";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const computeStringTransformation = (value: string, transformation: StringTransformation): string => {
  if (transformation.transform === StringTransformationType.Trim) return value.trim();
  if (transformation.transform === StringTransformationType.Lowercase) return value.toLowerCase();
  if (transformation.transform === StringTransformationType.Uppercase) return value.toUpperCase();
  if (transformation.transform === StringTransformationType.TitleCase)
    return value.toLowerCase().replaceAll(/(?:^|\s)\S/g, (char) => char.toUpperCase());
  throw new InvalidOperationError(
    Operation.Update,
    computeStringTransformation.name,
    `Unknown transform: ${transformation.transform}`,
  );
};
