import { normalizeString } from "@esposter/shared";

export const deserializeCsvLine = (line: string, delimiter: string) => {
  const fields: string[] = [];
  let currentField = "";
  let isInQuotes = false;

  for (let index = 0; index < line.length; index++) {
    const character = line.charAt(index);
    if (character === '"')
      if (isInQuotes && line.charAt(index + 1) === '"') {
        currentField += '"';
        index++;
      } else isInQuotes = !isInQuotes;
    else if (character === delimiter && !isInQuotes) {
      fields.push(normalizeString(currentField));
      currentField = "";
    } else currentField += character;
  }

  fields.push(normalizeString(currentField));
  return fields;
};
