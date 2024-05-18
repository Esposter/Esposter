import type { CamelToKebab } from "@/util/types/CamelToKebab";

export const toKebabCase = <T extends string>(string: T) =>
  (string
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map((x) => x.toLowerCase())
    .join("-") ?? "") as CamelToKebab<T>;
