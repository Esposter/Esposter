import type { TMXEditorSettingsParsed } from "#src/models/tmx/parsed/TMXEditorSettingsParsed";
import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";
import type { TMXFrame } from "#src/models/tmx/TMXFrame";

import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { openTmxLayer } from "#src/services/openTmxLayer";
import { openTmxProperties } from "#src/services/openTmxProperties";
import { openTmxTileset } from "#src/services/openTmxTileset";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The children a map element does not model are skipped, and any other child is refused by name
export const openTmxMapChild = (
  parent: Extract<TMXFrame, { tag: TMXTagName.Map }>,
  name: string,
  tag: TMXTagName | undefined,
  attributes: TMXAttributes,
): TMXFrame | undefined => {
  const map = parent.target;
  switch (tag) {
    case TMXTagName.Properties:
      return openTmxProperties(map);
    case TMXTagName.EditorSettings: {
      const editorSettings: TMXEditorSettingsParsed = {};
      map.editorsettings = editorSettings;
      return { tag, target: editorSettings, text: "" };
    }
    case TMXTagName.Tileset:
      return openTmxTileset(map.tilesets, attributes);
    case TMXTagName.Group:
    case TMXTagName.ImageLayer:
    case TMXTagName.Layer:
    case TMXTagName.Objectgroup:
      return openTmxLayer(map.layers, tag, attributes);
    case TMXTagName.Data:
    case TMXTagName.Export:
    case TMXTagName.Image:
    case TMXTagName.Object:
    case TMXTagName.Property:
      return undefined;
    default:
      throw new InvalidOperationError(Operation.Read, openTmxMapChild.name, `${name} is not a map child`);
  }
};
