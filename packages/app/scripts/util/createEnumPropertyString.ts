import { startsWithNumber } from "#shared/util/regex/startsWithNumber";

export const createEnumPropertyString = (name: string) => {
  // We'll support enum properties that start with numbers
  // as tools like Tiled may contain them in enums
  if (startsWithNumber(name)) return `"@${name}"`;
  else if (name.includes("/")) return `"${name}"`;
  else return name;
};
