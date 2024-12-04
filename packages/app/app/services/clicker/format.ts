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

const formatShort = ["k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No"];
const prefixesShort = ["", "Un", "Do", "Tr", "Qa", "Qi", "Sx", "Sp", "Oc", "No"];
const suffixesShort = ["Dc", "V", "T", "Qa", "Qi", "Sx", "Sp", "O", "N"];

for (const suffixShort of suffixesShort)
  for (const prefixShort of prefixesShort) formatShort.push(` ${prefixShort}${suffixShort}`);

const formatEveryThirdPower = (notations: string[]) => (number: number, fractionDigits?: number) => {
  if (!isFinite(number)) return "Infinity";

  let base = -1;
  let notation = "";

  while (Math.round(number) >= 1e3) {
    number /= 1e3;
    base++;
  }

  if (base > notations.length - 1) return "Infinity";
  else if (base >= 0) notation = notations[base];

  let formattedNumber: number | string = Math.round(number * 1e3) / 1e3;
  if (fractionDigits !== undefined) formattedNumber = formattedNumber.toFixed(fractionDigits);

  return `${formattedNumber}${notation}`;
};

export const formatNumberLong = formatEveryThirdPower(formatLong);
export const formatNumberShort = formatEveryThirdPower(formatShort);
