export const sanitizeFilename = (filename: string) => filename.replaceAll(/[\\/]/gu, "-");
