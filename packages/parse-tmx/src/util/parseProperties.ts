import type { TMXPropertyNode } from "@/models/tmx/node/TMXPropertyNode";
import type { TMXPropertiesParsed } from "@/models/tmx/parsed/TMXPropertiesParsed";

import { takeOne } from "@esposter/shared";

export const parseProperties = (properties: { property: TMXPropertyNode[] }[]): TMXPropertiesParsed =>
  properties.map(({ property }) => {
    const { $, _ } = takeOne(property);
    const { name, value } = $;
    return { name, value: value ?? _ };
  });
