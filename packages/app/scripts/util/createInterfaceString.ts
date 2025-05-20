import type { InterfaceProperty } from "@@/scripts/models/InterfaceProperty";

import { EN_US_COMPARATOR } from "@/services/shared/constants";
import { startsWithNumber } from "@/util/regex/startsWithNumber";

export const createInterfaceString = (name: string, properties: InterfaceProperty[]) =>
  properties.length === 0
    ? `export interface ${name} {}\n`
    : [
        `export interface ${name} {`,
        properties
          .toSorted((a, b) => EN_US_COMPARATOR.compare(a.name, b.name))
          .map(({ name, type }) => `  ${startsWithNumber(name) ? `"@${name}"` : name}: ${type};`)
          .join("\n"),
        "}\n",
      ].join("\n");
