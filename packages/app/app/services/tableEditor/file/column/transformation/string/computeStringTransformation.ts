import { StringTransformationType } from "#shared/models/tableEditor/file/column/transformation/string/StringTransformationType";
import { exhaustiveGuard } from "@esposter/shared";

export const computeStringTransformation = (value: string, transform: StringTransformationType): string => {
  switch (transform) {
    case StringTransformationType.Lowercase:
      return value.toLowerCase();
    case StringTransformationType.TitleCase:
      return value.toLowerCase().replaceAll(/(?:^|\s)\S/g, (char) => char.toUpperCase());
    case StringTransformationType.Trim:
      return value.trim();
    case StringTransformationType.Uppercase:
      return value.toUpperCase();
    default:
      return exhaustiveGuard(transform);
  }
};
