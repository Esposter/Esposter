import type { TMXEditorSettingsParsed } from "#src/models/tmx/parsed/TMXEditorSettingsParsed";
import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";
import type { TMXFrame } from "#src/models/tmx/TMXFrame";

import { AttributeKind } from "#src/models/AttributeKind";
import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { createEmbeddedTileset } from "#src/services/createEmbeddedTileset";
import { openTmxLayer } from "#src/services/openTmxLayer";
import { openTmxProperties } from "#src/services/openTmxProperties";
import { readTmxAttributes } from "#src/services/readTmxAttributes";
import { InvalidOperationError, Operation } from "@esposter/shared";

const externalTilesetAttributeKindMap = {
  firstgid: AttributeKind.RequiredNumber,
  source: AttributeKind.RequiredString,
} as const;

// The children a map element does not model are skipped, and any other child is refused by name
export const openTmxMapChild = (
  parent: Extract<TMXFrame, { tag: TMXTagName.Map }>,
  name: string,
  tag: TMXTagName | undefined,
  attributes: TMXAttributes,
): TMXFrame | undefined => {
  const map = parent.target;
  switch (tag) {
    case TMXTagName.Data:
    case TMXTagName.Export:
    case TMXTagName.Image:
    case TMXTagName.Object:
    case TMXTagName.Property:
      return undefined;
    case TMXTagName.EditorSettings: {
      const editorSettings: TMXEditorSettingsParsed = {};
      map.editorsettings = editorSettings;
      return { tag, target: editorSettings, text: "" };
    }
    case TMXTagName.Group:
    case TMXTagName.ImageLayer:
    case TMXTagName.Layer:
    case TMXTagName.Objectgroup:
      return openTmxLayer(map.layers, tag, attributes);
    case TMXTagName.Properties:
      return openTmxProperties(map);
    case TMXTagName.Tileset: {
      // A tileset that names a file is kept as the reference it is, and its file is not opened. Its children are not read.
      if (attributes.source !== undefined) {
        map.tilesets.push(readTmxAttributes(attributes, externalTilesetAttributeKindMap));
        return undefined;
      }
      const tileset = createEmbeddedTileset(attributes);
      map.tilesets.push(tileset);
      return { tag, target: tileset, text: "" };
    }
    default:
      throw new InvalidOperationError(Operation.Read, openTmxMapChild.name, `${name} is not a map child`);
  }
};
