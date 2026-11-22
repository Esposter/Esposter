// A whole package name that a regex source matches
export const wholeNameRegex = (nameSource: string): RegExp => new RegExp(String.raw`^${nameSource}$`, "u");
