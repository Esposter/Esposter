// A JSON string's characters as they stand between its quotes, so a path is found however the file escapes it
export const toEscaped = (path: string): string => JSON.stringify(path).slice(1, -1);
