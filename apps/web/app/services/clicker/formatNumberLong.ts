import { takeOne } from "@esposter/shared";

const LONG_FORMATS = [
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
const LONG_PREFIXES = ["", "un", "duo", "tre", "quattuor", "quin", "sex", "septen", "octo", "novem"];
const LONG_SUFFIXES = [
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

for (const suffixLong of LONG_SUFFIXES)
  for (const prefixLong of LONG_PREFIXES) LONG_FORMATS.push(` ${prefixLong}${suffixLong}`);

export const formatNumberLong = (number: number, fractionDigits?: number) => {
  if (!Number.isFinite(number)) return "Infinity";

  let base = -1;
  let notation = "";
  let currentNumber = number;

  while (Math.round(currentNumber) >= 1e3) {
    currentNumber /= 1e3;
    base++;
  }

  if (base > LONG_FORMATS.length - 1) return "Infinity";
  else if (base >= 0) notation = takeOne(LONG_FORMATS, base);

  let formattedNumber: number | string = Math.round(currentNumber * 1e3) / 1e3;
  if (fractionDigits !== undefined) formattedNumber = formattedNumber.toFixed(fractionDigits);

  return `${formattedNumber}${notation}`;
};
