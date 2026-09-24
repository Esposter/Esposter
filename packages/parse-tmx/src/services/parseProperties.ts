import type { TMXPropertiesElement } from "#src/models/tmx/node/TMXPropertiesElement";
import type { TMXPropertiesParsed } from "#src/models/tmx/parsed/TMXPropertiesParsed";

export const parseProperties = (properties: TMXPropertiesElement[]): TMXPropertiesParsed =>
  properties.flatMap(({ property }) => property.map(({ $: { name, value }, _ }) => ({ name, value: value ?? _ })));
