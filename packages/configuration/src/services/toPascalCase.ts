export const toPascalCase = (segment: string): string =>
  segment
    .split(/[-_]/u)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join("");
