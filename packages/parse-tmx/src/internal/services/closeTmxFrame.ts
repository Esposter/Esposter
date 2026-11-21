import type { TMXFrame } from "#src/internal/models/tmx/TMXFrame";

import { TMXTagName } from "#src/internal/models/tmx/TMXTagName";
import { parsePropertyValue } from "#src/internal/services/parsePropertyValue";
import { PropertyType } from "#src/models/PropertyType";

// Reads the character data an element holds once it has closed: a property's value, a text's content, and a tile
// Data's encoded cells. Every other element is complete when it opens.
export const closeTmxFrame = (frame: TMXFrame): void => {
  switch (frame.tag) {
    case TMXTagName.Chunk:
    case TMXTagName.Data:
    case TMXTagName.Text:
      frame.target.text = frame.text;
      return;
    case TMXTagName.Property:
      // A class-typed property holds nested properties in place of a value
      if (frame.propertyType === PropertyType.Class) return;
      frame.target.value = parsePropertyValue(frame.propertyType, frame.valueAttribute ?? frame.text);
      return;
    default:
      return;
  }
};
