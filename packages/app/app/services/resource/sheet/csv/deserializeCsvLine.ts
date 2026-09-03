import { normalizeString } from "@esposter/shared";

export const deserializeCsvLine = (line: string, delimiter: string): string[] => {
  const fields: string[] = [];
  let currentField = "";
  let isInQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line.charAt(i);
    if (char === '"')
      if (isInQuotes && line.charAt(i + 1) === '"') {
        currentField += '"';
        i++;
      } else isInQuotes = !isInQuotes;
    else if (char === delimiter && !isInQuotes) {
      fields.push(normalizeString(currentField));
      currentField = "";
    } else currentField += char;
  }

  fields.push(normalizeString(currentField));
  return fields;
};
