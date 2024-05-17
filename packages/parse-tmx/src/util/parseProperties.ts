import type { TMXPropertyNode } from "@/src/models/tmx/node/TMXPropertyNode";
import type { TMXPropertiesParsed } from "@/src/models/tmx/parsed/TMXPropertiesParsed";

export const parseProperties = (properties?: { property: TMXPropertyNode[] }[]): TMXPropertiesParsed | undefined =>
  properties
    ? properties.map(({ property }) => {
        const { $, _ } = property[0];
        const { name, value } = $;
        return { name, value: value ?? _ };
      })
    : undefined;
