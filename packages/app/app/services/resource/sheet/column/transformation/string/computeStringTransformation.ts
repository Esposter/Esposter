import { StringTransformationType } from "#shared/models/resource/sheet/column/transformation/string/StringTransformationType";
import { exhaustiveGuard } from "@esposter/shared";

export const computeStringTransformation = (
  value: string,
  stringTransformationType: StringTransformationType,
): string => {
  switch (stringTransformationType) {
    case StringTransformationType.LowerCase:
      return value.toLowerCase();
    case StringTransformationType.TitleCase:
      return value.toLowerCase().replaceAll(/(?:^|\s)\S/gu, (char) => char.toUpperCase());
    case StringTransformationType.Trim:
      return value.trim();
    case StringTransformationType.UpperCase:
      return value.toUpperCase();
    default:
      return exhaustiveGuard(stringTransformationType);
  }
};
