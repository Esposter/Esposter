import type { TMXPropertyNode } from "#src/models/tmx/node/TMXPropertyNode";
import type { TMXPropertiesParsed } from "#src/models/tmx/parsed/TMXPropertiesParsed";

export const parseProperties = (properties: { property: TMXPropertyNode[] }[]): TMXPropertiesParsed =>
  properties.flatMap(({ property }) => property.map(({ $: { name, value }, _ }) => ({ name, value: value ?? _ })));
