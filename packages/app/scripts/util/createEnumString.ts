import { createEnumPropertyString } from "@@/scripts/util/createEnumPropertyString";

export const createEnumString = (name: string, properties: string[]) =>
  properties.length === 0
    ? `export enum ${name} {}\n`
    : [
        `export enum ${name} {`,
        properties
          .toSorted((a, b) => a.localeCompare(b))
          .map((m) => `  ${createEnumPropertyString(m)} = "${m}",`)
          .join("\n"),
        "}\n",
      ].join("\n");
