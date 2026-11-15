import { createValueSetPropertyString } from "#scripts/util/createValueSetPropertyString";
import { EN_US_COMPARATOR } from "#shared/services/intl/constants";

export const createValueSetString = (name: string, properties: string[]) =>
  [
    properties.length === 0
      ? `export const ${name} = {} as const;`
      : [
          `export const ${name} = {`,
          properties
            .toSorted((firstProperty, secondProperty) => EN_US_COMPARATOR.compare(firstProperty, secondProperty))
            .map((property) => `  ${createValueSetPropertyString(property)}: "${property}",`)
            .join("\n"),
          "} as const;",
        ].join("\n"),
    `export type ${name} = (typeof ${name})[keyof typeof ${name}];\n`,
  ].join("\n");
