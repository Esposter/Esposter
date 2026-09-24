import { normalizeString } from "@esposter/shared";

// A quoted field may contain the record separator itself, so splitting on newlines is only correct
// Outside quotes. Quotes are kept in the output for deserializeCsvLine to strip.
export const splitCsvRecords = (text: string) => {
  const records: string[] = [];
  let currentRecord = "";
  let isInQuotes = false;

  for (let index = 0; index < text.length; index++) {
    const character = text.charAt(index);
    if (character === '"') {
      currentRecord += character;
      if (isInQuotes && text.charAt(index + 1) === '"') {
        currentRecord += '"';
        index++;
      } else isInQuotes = !isInQuotes;
    } else if (!isInQuotes && (character === "\n" || character === "\r")) {
      if (character === "\r" && text.charAt(index + 1) === "\n") index++;
      records.push(currentRecord);
      currentRecord = "";
    } else currentRecord += character;
  }

  records.push(currentRecord);
  return records.filter((record) => Boolean(normalizeString(record)));
};
