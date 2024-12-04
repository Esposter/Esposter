import type { InterfaceProperty } from "@@/scripts/models/InterfaceProperty";

import { startsWithNumber } from "@/util/regex/startsWithNumber";

export const generateInterfaceString = (name: string, properties: InterfaceProperty[]) =>
  properties.length === 0
    ? `export interface ${name} {}\n`
    : [
        `export interface ${name} {`,
        properties
          .toSorted((a, b) => a.name.localeCompare(b.name))
          .map(({ name, type }) => `  ${startsWithNumber(name) ? `"@${name}"` : name}: ${type};`)
          .join("\n"),
        "}\n",
      ].join("\n");
