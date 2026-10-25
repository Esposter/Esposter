import type { TMXPropertyParsed } from "#src/models/tmx/parsed/TMXPropertyParsed";
import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";
import type { TMXFrame } from "#src/models/tmx/TMXFrame";

import { AttributeKind } from "#src/models/AttributeKind";
import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { parsePropertyType } from "#src/services/parsePropertyType";
import { readTmxAttributes } from "#src/services/readTmxAttributes";

const propertyAttributeKindMap = { name: AttributeKind.RequiredString } as const;

// A property's value is read once it closes, since its character data is what it holds when it has no value attribute
export const openTmxPropertyChild = (
  parent: Extract<TMXFrame, { tag: TMXTagName.Properties }>,
  tag: TMXTagName | undefined,
  attributes: TMXAttributes,
): TMXFrame | undefined => {
  if (tag !== TMXTagName.Property) return undefined;
  const target: TMXPropertyParsed = { ...readTmxAttributes(attributes, propertyAttributeKindMap), value: "" };
  parent.target.push(target);
  return { propertyType: parsePropertyType(attributes.type), tag, target, text: "", valueAttribute: attributes.value };
};
