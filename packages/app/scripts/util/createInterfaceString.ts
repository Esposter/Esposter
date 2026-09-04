import type { InterfaceProperty } from "@@/scripts/models/InterfaceProperty";

import { EN_US_COMPARATOR } from "#shared/services/intl/constants";
import { checkStartsWithNumber } from "#shared/util/regex/checkStartsWithNumber";

export const createInterfaceString = (name: string, properties: InterfaceProperty[]) =>
  properties.length === 0
    ? `export interface ${name} {}\n`
    : [
        `export interface ${name} {`,
        properties
          .toSorted((firstProperty, secondProperty) =>
            EN_US_COMPARATOR.compare(firstProperty.name, secondProperty.name),
          )
          .map(
            ({ name: propertyName, type }) =>
              `  ${checkStartsWithNumber(propertyName) ? `"@${propertyName}"` : propertyName}: ${type};`,
          )
          .join("\n"),
        "}\n",
      ].join("\n");
