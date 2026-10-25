// The camel-cased words of a name, `Boundless Origin` as `boundlessOrigin`
export const toCamelCase = (text: string): string =>
  text
    .split(/[^A-Za-z0-9]+/u)
    .filter(Boolean)
    .map((word, index) => (index === 0 ? word.charAt(0).toLowerCase() : word.charAt(0).toUpperCase()) + word.slice(1))
    .join("");
