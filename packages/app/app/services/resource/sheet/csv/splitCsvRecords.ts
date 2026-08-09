import { normalizeString } from "@esposter/shared";

// A quoted field may contain the record separator itself, so splitting on newlines is only correct
// outside quotes. Quotes are kept in the output for deserializeCsvLine to strip.
export const splitCsvRecords = (text: string): string[] => {
  const records: string[] = [];
  let current = "";
  let isInQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text.charAt(i);
    if (char === '"') {
      current += char;
      if (isInQuotes && text.charAt(i + 1) === '"') {
        current += '"';
        i++;
      } else isInQuotes = !isInQuotes;
    } else if (!isInQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && text.charAt(i + 1) === "\n") i++;
      records.push(current);
      current = "";
    } else current += char;
  }

  records.push(current);
  return records.filter((record) => Boolean(normalizeString(record)));
};
