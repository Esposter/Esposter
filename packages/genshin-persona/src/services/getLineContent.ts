// The prefix a reply line opens with: its indentation, then a blockquote marker for each quote it sits in. A spoken
// Line and a fence are both read past it, so the two cannot disagree on where a line's content begins
const LINE_PREFIX_REGEX = /^(?:\s*>\s?)*\s*/u;

export const getLineContent = (line: string): string => line.replace(LINE_PREFIX_REGEX, "");
