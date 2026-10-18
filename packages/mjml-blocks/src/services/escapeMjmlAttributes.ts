import { escapeAttribute } from "@esposter/shared";

// MJML writes an attribute's value as given, so each value is escaped here, once
export const escapeMjmlAttributes = (attributes: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(attributes).map(([name, value]) => [name, escapeAttribute(value)]));
