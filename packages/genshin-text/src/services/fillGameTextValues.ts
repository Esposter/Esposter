// The game's interface strings number what they are filled with, `{0}` first: a count, a level, an item's name. Each
// Takes the value at its number, as it is, and one with no value stays
const VALUE_PLACEHOLDER_REGEX = /\{(?<index>\d+)\}/gu;

export const fillGameTextValues = (text: string, ...values: (number | string)[]): string =>
  text.replaceAll(VALUE_PLACEHOLDER_REGEX, (placeholder: string, index: string) =>
    String(values[Number(index)] ?? placeholder),
  );
