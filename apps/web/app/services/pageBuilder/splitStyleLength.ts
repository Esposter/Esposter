import { STYLE_LENGTH_UNITS } from "@/services/pageBuilder/constants";

// A length's text as the number and the unit its field draws, the unit empty when the text names none. A text that is
// Not a length, such as a keyword or a function, splits to nothing and stays a text field. Only the units the property
// Takes split as a unit, so a percentage left on a border's width stays text
export const splitStyleLength = (value: string, units: readonly string[] = STYLE_LENGTH_UNITS) => {
  const groups = new RegExp(`^(?<amount>-?(?:\\d+\\.?\\d*|\\.\\d+)?)(?<unit>${units.join("|")})?$`, "u").exec(
    value,
  )?.groups;
  if (!groups) return undefined;

  return { amount: groups.amount ?? "", unit: groups.unit ?? "" };
};
