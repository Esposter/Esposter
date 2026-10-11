import type { TMXAnimationParsed } from "#src/models/tmx/parsed/TMXAnimationParsed";
import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";
import type { TMXFrame } from "#src/models/tmx/TMXFrame";
import type { TMXTileParsed } from "#src/models/tmx/parsed/TMXTileParsed";

import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { createTmxAnimationFrame } from "#src/services/createTmxAnimationFrame";
import { createTmxImage } from "#src/services/createTmxImage";
import { openTmxProperties } from "#src/services/openTmxProperties";

// A tile holds an animation, an image and its object group and properties. An animation holds its frames.
export const openTmxTileChild = (
  parent: Extract<TMXFrame, { tag: TMXTagName.Tile }>,
  tag: TMXTagName | undefined,
  attributes: TMXAttributes,
): TMXFrame | undefined => {
  const tile: TMXTileParsed = parent.target;
  switch (tag) {
    case TMXTagName.Animation: {
      const animation: TMXAnimationParsed = { frames: [] };
      tile.animation = animation;
      return { tag, target: animation, text: "" };
    }
    case TMXTagName.Image: {
      const image = createTmxImage(attributes);
      tile.image = image;
      return { tag, target: image, text: "" };
    }
    case TMXTagName.Objectgroup:
      return { tag, target: tile, text: "" };
    case TMXTagName.Properties:
      return openTmxProperties(tile);
    default:
      return undefined;
  }
};

export const openTmxAnimationFrame = (
  parent: Extract<TMXFrame, { tag: TMXTagName.Animation }>,
  tag: TMXTagName | undefined,
  attributes: TMXAttributes,
): TMXFrame | undefined => {
  if (tag !== TMXTagName.Frame) return undefined;
  const frame = createTmxAnimationFrame(attributes);
  parent.target.frames.push(frame);
  return { tag, target: frame, text: "" };
};
