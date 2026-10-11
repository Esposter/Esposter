import type { TMXFrame } from "#src/models/tmx/TMXFrame";

import { PropertyType } from "#src/models/PropertyType";
import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { exhaustiveGuard } from "@esposter/shared";

// A property's value read as its type says it is, so a string property holding "1" stays a string
const parsePropertyValue = (propertyType: PropertyType, value: string): boolean | number | string => {
  switch (propertyType) {
    case PropertyType.Bool:
      return value === "true";
    case PropertyType.Float:
    case PropertyType.Int:
      return Number(value);
    case PropertyType.Class:
    case PropertyType.Color:
    case PropertyType.File:
    case PropertyType.Object:
    case PropertyType.String:
      return value;
    default:
      return exhaustiveGuard(propertyType);
  }
};

// Reads the character data an element holds once it has closed: a property's value, a text's content, and a tile
// Data's encoded cells. Every other element is complete when it opens.
export const closeTmxFrame = (frame: TMXFrame): void => {
  switch (frame.tag) {
    case TMXTagName.Property:
      // A class-typed property holds nested properties in place of a value
      if (frame.propertyType === PropertyType.Class) return;
      frame.target.value = parsePropertyValue(frame.propertyType, frame.valueAttribute ?? frame.text);
      return;
    case TMXTagName.Chunk:
    case TMXTagName.Data:
    case TMXTagName.Text:
      frame.target.text = frame.text;
      return;
    default:
      return;
  }
};
