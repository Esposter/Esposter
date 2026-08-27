import { checkStartsWithNumber } from "#shared/util/regex/checkStartsWithNumber";

export const createEnumPropertyString = (name: string) => {
  // We'll support enum properties that start with numbers
  // As tools like Tiled may contain them in enums
  if (checkStartsWithNumber(name)) return `"@${name}"`;
  else if (name.includes("/")) return `"${name}"`;
  else return name;
};
