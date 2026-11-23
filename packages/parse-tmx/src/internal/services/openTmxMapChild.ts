import type { TMXAttributes } from "#src/internal/models/tmx/TMXAttributes";
import type { TMXFrame } from "#src/internal/models/tmx/TMXFrame";
import type { TMXEditorSettingsParsed } from "#src/models/tmx/parsed/TMXEditorSettingsParsed";

import { AttributeKind } from "#src/internal/models/AttributeKind";
import { TMXTagName } from "#src/internal/models/tmx/TMXTagName";
import { createEmbeddedTileset } from "#src/internal/services/createEmbeddedTileset";
import { openTmxLayer } from "#src/internal/services/openTmxLayer";
import { openTmxProperties } from "#src/internal/services/openTmxProperties";
import { readTmxAttributes } from "#src/internal/services/readTmxAttributes";
import { InvalidOperationError, Operation } from "@esposter/shared";

const externalTilesetAttributeKindMap = {
  firstgid: AttributeKind.RequiredNumber,
  source: AttributeKind.RequiredString,
} as const;

// The children a map element does not model are skipped, and any other child is refused by name
export const openTmxMapChild = (
  parent: Extract<TMXFrame, { tag: typeof TMXTagName.Map }>,
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
      // A tileset that names a file is kept as the reference it is, and its file is not opened. Its children are not
      // Read.
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
