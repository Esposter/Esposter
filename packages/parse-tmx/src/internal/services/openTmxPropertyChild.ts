import type { TMXAttributes } from "#src/internal/models/tmx/TMXAttributes";
import type { TMXFrame } from "#src/internal/models/tmx/TMXFrame";
import type { TMXPropertyParsed } from "#src/models/tmx/parsed/TMXPropertyParsed";

import { AttributeKind } from "#src/internal/models/AttributeKind";
import { TMXTagName } from "#src/internal/models/tmx/TMXTagName";
import { parsePropertyType } from "#src/internal/services/parsePropertyType";
import { readTmxAttributes } from "#src/internal/services/readTmxAttributes";

const propertyAttributeKindMap = { name: AttributeKind.RequiredString } as const;

// A property's value is read once it closes, since its character data is what it holds when it has no value attribute
export const openTmxPropertyChild = (
  parent: Extract<TMXFrame, { tag: typeof TMXTagName.Properties }>,
  tag: TMXTagName | undefined,
  attributes: TMXAttributes,
): TMXFrame | undefined => {
  if (tag !== TMXTagName.Property) return undefined;
  const target: TMXPropertyParsed = { ...readTmxAttributes(attributes, propertyAttributeKindMap), value: "" };
  parent.target.push(target);
  return { propertyType: parsePropertyType(attributes.type), tag, target, text: "", valueAttribute: attributes.value };
};
