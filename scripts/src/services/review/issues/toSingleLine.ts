// A line break in a reviewer's or a fixer's free text would open a line of an issue body, which the body reads back as a
// Finding of its own, so each whitespace run holding one collapses to a single space
export const toSingleLine = (text: string): string => text.replaceAll(/\s*[\r\n]\s*/gu, " ");
