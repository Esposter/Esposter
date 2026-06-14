export const escapeLike = (value: string): string => value.replaceAll(/[%_\\]/gu, String.raw`\$&`);
