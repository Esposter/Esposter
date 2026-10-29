// A table cell's `|` would end the cell early
export const toCell = (text: string): string => text.replaceAll("|", String.raw`\|`);
