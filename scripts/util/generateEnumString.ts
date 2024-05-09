import { startsWithNumber } from "@/util/regex/startsWithNumber";

export const generateEnumString = (name: string, members: string[]) =>
  members.length === 0
    ? `export enum ${name} {}\n`
    : [
        `export enum ${name} {`,
        // We'll support enum members that start with numbers
        // as tools like Tiled may contain them in enums
        members.map((m) => `  ${startsWithNumber(m) ? `"@${m}"` : m} = "${m}",`).join("\n"),
        "}\n",
      ].join("\n");
