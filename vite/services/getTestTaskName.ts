export const getTestTaskName = (directory: string): string => `test:${directory.split("/").pop()}`;
