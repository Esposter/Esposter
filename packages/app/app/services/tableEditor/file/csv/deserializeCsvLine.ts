import { normalizeString } from "@esposter/shared";

export const deserializeCsvLine = (line: string, delimiter: string): string[] => {
  const fields: string[] = [];
  let current = "";
  let isInQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line.charAt(i);
    if (char === '"')
      if (isInQuotes && line.charAt(i + 1) === '"') {
        current += '"';
        i++;
      } else isInQuotes = !isInQuotes;
    else if (char === delimiter && !isInQuotes) {
      fields.push(normalizeString(current));
      current = "";
    } else current += char;
  }

  fields.push(normalizeString(current));
  return fields;
};
