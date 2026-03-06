export const parseCsvLine = (line: string): string[] => {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"')
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else inQuotes = !inQuotes;
    else if (char === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else current += char;
  }

  fields.push(current.trim());
  return fields;
};
