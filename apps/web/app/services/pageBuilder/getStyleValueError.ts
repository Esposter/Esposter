import type { StyleProperty } from "#shared/models/pageBuilder/StyleProperty";

import { styleValueSchema } from "#shared/models/pageBuilder/StyleValue";
import { checkIsBlankText } from "@esposter/shared";

// The message a style value is refused with as it is typed, or undefined when it may be saved. An empty value is saved:
// It sets no declaration. The browser's own check decides whether the property takes the value
export const getStyleValueError = (property: StyleProperty, value: string) => {
  if (checkIsBlankText(value)) return undefined;
  else if (!styleValueSchema.safeParse(value).success)
    return "Keep out braces, angle brackets and comment delimiters, and keep it short";
  else if (CSS.supports(property, value)) return undefined;
  else return `${property} does not take this value`;
};
