import { StringTransformationType } from "#shared/models/tableEditor/file/column/transformation/string/StringTransformationType";
import { exhaustiveGuard } from "@esposter/shared";

export const computeStringTransformation = (value: string, transform: StringTransformationType): string => {
  switch (transform) {
    case StringTransformationType.LowerCase:
      return value.toLowerCase();
    case StringTransformationType.TitleCase:
      return value.toLowerCase().replaceAll(/(?:^|\s)\S/gu, (char) => char.toUpperCase());
    case StringTransformationType.Trim:
      return value.trim();
    case StringTransformationType.UpperCase:
      return value.toUpperCase();
    default:
      return exhaustiveGuard(transform);
  }
};
