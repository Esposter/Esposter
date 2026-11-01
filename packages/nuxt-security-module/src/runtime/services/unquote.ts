export const unquote = (value: string): string => value.replace(/^(?<quote>["'])(?<inner>.*)\k<quote>$/su, "$<inner>");
