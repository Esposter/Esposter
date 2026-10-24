import type { StyleProperty } from "#shared/models/pageBuilder/StyleProperty";

import { styleValueSchema } from "#shared/models/pageBuilder/StyleValue";

// The message a style value is refused with as it is typed, or undefined when it may be saved. An empty value is saved:
// It sets no declaration. The browser's own check decides whether the property takes the value
export const getStyleValueError = (property: StyleProperty, value: string): string | undefined => {
  if (value === "") return undefined;
  if (!styleValueSchema.safeParse(value).success)
    return "Keep out braces, angle brackets and comment delimiters, and keep it short";
  if (!CSS.supports(property, value)) return `${property} does not take this value`;

  return undefined;
};
