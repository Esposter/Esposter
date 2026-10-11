import type { TMXPropertiesParsed } from "#src/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXFrame } from "#src/models/tmx/TMXFrame";

import { TMXTagName } from "#src/models/tmx/TMXTagName";

// The property list an element holds, created on its first `<properties>` and filled by that element's children
export const openTmxProperties = (target: { properties?: TMXPropertiesParsed }): TMXFrame => {
  target.properties ??= [];
  return { tag: TMXTagName.Properties, target: target.properties, text: "" };
};
