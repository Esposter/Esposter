import { takeOne } from "@esposter/shared";

const formatLong = [
  " thousand",
  " million",
  " billion",
  " trillion",
  " quadrillion",
  " quintillion",
  " sextillion",
  " septillion",
  " octillion",
  " nonillion",
];
const prefixesLong = ["", "un", "duo", "tre", "quattuor", "quin", "sex", "septen", "octo", "novem"];
const suffixesLong = [
  "decillion",
  "vigintillion",
  "trigintillion",
  "quadragintillion",
  "quinquagintillion",
  "sexagintillion",
  "septuagintillion",
  "octogintillion",
  "nonagintillion",
];

for (const suffixLong of suffixesLong)
  for (const prefixLong of prefixesLong) formatLong.push(` ${prefixLong}${suffixLong}`);

const formatEveryThirdPower = (notations: string[]) => (number: number, fractionDigits?: number) => {
  if (!Number.isFinite(number)) return "Infinity";

  let base = -1;
  let notation = "";
  let currentNumber = number;

  while (Math.round(currentNumber) >= 1e3) {
    currentNumber /= 1e3;
    base++;
  }

  if (base > notations.length - 1) return "Infinity";
  else if (base >= 0) notation = takeOne(notations, base);

  let formattedNumber: number | string = Math.round(currentNumber * 1e3) / 1e3;
  if (fractionDigits !== undefined) formattedNumber = formattedNumber.toFixed(fractionDigits);

  return `${formattedNumber}${notation}`;
};

export const formatNumberLong = formatEveryThirdPower(formatLong);
