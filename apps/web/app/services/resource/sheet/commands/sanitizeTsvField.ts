export const sanitizeTsvField = (value: string) => value.replaceAll(/[\t\r\n]/gu, " ");
