export const quotePosix = (value: string) => `'${value.replaceAll("'", String.raw`'\''`)}'`;
