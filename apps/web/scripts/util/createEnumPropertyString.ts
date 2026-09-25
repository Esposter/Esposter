import { checkStartsWithNumber } from "#shared/util/regex/checkStartsWithNumber";
import { capitalize } from "@esposter/shared";

export const createEnumPropertyString = (name: string) => {
  // We'll support enum properties that start with numbers
  // As tools like Tiled may contain them in enums
  if (checkStartsWithNumber(name)) return `"@${name}"`;
  else if (name.includes("/")) return `"${name}"`;
  // A member is PascalCase whatever the value it stands for is spelled as
  else return capitalize(name);
};
