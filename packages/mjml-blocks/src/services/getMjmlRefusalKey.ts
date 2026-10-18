// The key a tag the package refuses is kept under: its name in angle brackets, which no prop the root or the head reads can be
export const getMjmlRefusalKey = (tagName: string): string => `<${tagName}>`;
