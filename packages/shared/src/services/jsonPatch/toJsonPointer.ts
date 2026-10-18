export const toJsonPointer = (segments: string[]): string =>
  segments.map((segment) => `/${segment.replaceAll("~", "~0").replaceAll("/", "~1")}`).join("");
