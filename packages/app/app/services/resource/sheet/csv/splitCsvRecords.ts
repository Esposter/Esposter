import { normalizeString } from "@esposter/shared";

// A quoted field may contain the record separator itself, so splitting on newlines is only correct
// Outside quotes. Quotes are kept in the output for deserializeCsvLine to strip.
export const splitCsvRecords = (text: string): string[] => {
  const records: string[] = [];
  let currentRecord = "";
  let isInQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text.charAt(i);
    if (char === '"') {
      currentRecord += char;
      if (isInQuotes && text.charAt(i + 1) === '"') {
        currentRecord += '"';
        i++;
      } else isInQuotes = !isInQuotes;
    } else if (!isInQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && text.charAt(i + 1) === "\n") i++;
      records.push(currentRecord);
      currentRecord = "";
    } else currentRecord += char;
  }

  records.push(currentRecord);
  return records.filter((record) => Boolean(normalizeString(record)));
};
