// The signing time in SigV4's basic ISO 8601 form, `YYYYMMDD'T'HHMMSS'Z'`
export const getAmzDate = (date: Date): string => date.toISOString().replaceAll(/[:-]|\.\d{3}/gu, "");
