// The key a refused tag is kept under: its name in angle brackets, which no prop the root or the head can name.
export const getMjmlRefusalKey = (tagName: string): string => `<${tagName}>`;
