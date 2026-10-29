// The one key every inventory row sorts on: the package's directory, which is the same in every table that names it
export const getPathKey = (line: string): string => /`(?<path>packages\/[^`]+)`/u.exec(line)?.groups?.path || "";
