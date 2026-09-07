import { EN_US_COMPARATOR } from "#shared/services/intl/constants";
import { createEnumPropertyString } from "@@/scripts/util/createEnumPropertyString";

export const createEnumString = (name: string, properties: string[]) =>
  properties.length === 0
    ? `export enum ${name} {}\n`
    : [
        `export enum ${name} {`,
        properties
          .toSorted((firstProperty, secondProperty) => EN_US_COMPARATOR.compare(firstProperty, secondProperty))
          .map((property) => `  ${createEnumPropertyString(property)} = "${property}",`)
          .join("\n"),
        "}\n",
      ].join("\n");
