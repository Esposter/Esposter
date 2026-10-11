import type { TMXFrame } from "#src/models/tmx/TMXFrame";

import { PropertyType } from "#src/models/PropertyType";
import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { parsePropertyValue } from "#src/services/parsePropertyValue";

// Reads the character data an element holds once it has closed: a property's value, a text's content, and a tile
// Data's encoded cells. Every other element is complete when it opens.
export const closeTmxFrame = (frame: TMXFrame): void => {
  switch (frame.tag) {
    case TMXTagName.Property:
      // A class-typed property holds nested properties in place of a value
      if (frame.propertyType === PropertyType.Class) return;
      frame.target.value = parsePropertyValue(frame.propertyType, frame.valueAttribute ?? frame.text);
      return;
    case TMXTagName.Text:
      frame.target.text = frame.text;
      return;
    case TMXTagName.Chunk:
    case TMXTagName.Data:
      frame.target.text = frame.text;
      return;
    default:
      return;
  }
};
