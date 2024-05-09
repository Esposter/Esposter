import { generateEnumPropertyString } from "@/scripts/util/generateEnumPropertyString";

export const generateEnumString = (name: string, properties: string[]) =>
  properties.length === 0
    ? `export enum ${name} {}\n`
    : [
        `export enum ${name} {`,
        properties.map((m) => `  ${generateEnumPropertyString(m)} = "${m}",`).join("\n"),
        "}\n",
      ].join("\n");
