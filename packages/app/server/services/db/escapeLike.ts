export const escapeLike = (value: string): string =>
  value.replaceAll(new RegExp(String.raw`[%_\\]`, "gu"), String.raw`\$&`);
