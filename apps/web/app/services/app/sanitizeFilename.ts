export const sanitizeFilename = (filename: string): string => filename.replaceAll(/[\\/]/gu, "-");
