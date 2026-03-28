import { BasicStringTransformationType } from "#shared/models/tableEditor/file/column/transformation/string/BasicStringTransformationType";
import { exhaustiveGuard } from "@esposter/shared";

export const computeStringTransformation = (value: string, transform: BasicStringTransformationType): string => {
  switch (transform) {
    case BasicStringTransformationType.Lowercase:
      return value.toLowerCase();
    case BasicStringTransformationType.TitleCase:
      return value.toLowerCase().replaceAll(/(?:^|\s)\S/g, (char) => char.toUpperCase());
    case BasicStringTransformationType.Trim:
      return value.trim();
    case BasicStringTransformationType.Uppercase:
      return value.toUpperCase();
    default:
      return exhaustiveGuard(transform);
  }
};
