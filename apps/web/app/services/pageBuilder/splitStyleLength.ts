import { STYLE_LENGTH_UNITS } from "@/services/pageBuilder/constants";

// A length's text as the number and the unit its field draws, the unit empty when the text names none. A text that is
// Not a length, such as a keyword or a function, splits to nothing and stays a text field
const STYLE_LENGTH_REGEX = new RegExp(
  `^(?<amount>-?(?:\\d+\\.?\\d*|\\.\\d+)?)(?<unit>${STYLE_LENGTH_UNITS.join("|")})?$`,
  "u",
);

export const splitStyleLength = (value: string) => {
  const groups = STYLE_LENGTH_REGEX.exec(value)?.groups;
  if (!groups) return undefined;

  return { amount: groups.amount ?? "", unit: groups.unit ?? "" };
};
