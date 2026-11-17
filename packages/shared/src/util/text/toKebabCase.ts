export const toKebabCase = (string: string): string =>
  string
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/gu)
    ?.map((x) => x.toLowerCase())
    .join("-") ?? "";
