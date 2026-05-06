export const escapeRegExp = (string: string): string => string.replaceAll(/[.*+?^${}()|\[\]\\]/gu, String.raw`\$&`);
