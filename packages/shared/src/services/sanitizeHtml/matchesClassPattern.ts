// A pattern ending in a star matches any class it is the start of, so one rule covers a family such as hljs-keyword
export const matchesClassPattern = (className: string, pattern: string): boolean =>
  pattern.endsWith("*") ? className.startsWith(pattern.slice(0, -1)) : className === pattern;
