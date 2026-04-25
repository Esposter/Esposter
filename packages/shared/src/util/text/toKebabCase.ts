import type { KebabCase } from "type-fest";

export const toKebabCase = <T extends string>(string: T) =>
  (string
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map((x) => x.toLowerCase())
    .join("-") ?? "") as KebabCase<T>;
