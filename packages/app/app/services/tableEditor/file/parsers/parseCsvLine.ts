export const parseCsvLine = (line: string, delimiter: string): string[] => {
  const fields: string[] = [];
  let current = "";
  let isInQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"')
      if (isInQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else isInQuotes = !isInQuotes;
    else if (char === delimiter && !isInQuotes) {
      fields.push(current.trim());
      current = "";
    } else current += char;
  }

  fields.push(current.trim());
  return fields;
};
