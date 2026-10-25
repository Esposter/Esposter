export const getBraceBalance = (line: string): number => line.split("{").length - line.split("}").length;
