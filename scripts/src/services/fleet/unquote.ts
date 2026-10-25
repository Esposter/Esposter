const QUOTED_REGEX = /^(?<quote>["'])(?<text>.*)\k<quote>$/u;

export const unquote = (value: string): string => QUOTED_REGEX.exec(value)?.groups?.text ?? value;
