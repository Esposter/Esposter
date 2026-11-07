import type { SpriteAtlas } from "#src/models/genshinAssets/sprites/SpriteAtlas";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";

const UNROTATED_PACKING = "None";

// The fields of a Sprite's dump the reader takes, which AnimeStudio writes under the sprite's render data
const spriteDumpSchema = z.object({
  m_RD: z.object({
    settingsRaw: z.object({ packingRotation: z.string() }),
    texture: z.object({ IsNull: z.boolean(), Name: z.string() }),
    textureRect: z.object({ height: z.number(), width: z.number(), x: z.number(), y: z.number() }),
  }),
});

// A Sprite's dump as AnimeStudio writes it: the atlas its pixels are cut from, by the name its texture reference carries,
// and the rectangle inside that atlas. A sprite packed rotated holds its pixels turned, which a cut of its rectangle would
// not give, so it is refused rather than cut wrong
export const readSpriteRectangle = (dump: unknown): SpriteAtlas => {
  const { m_RD } = spriteDumpSchema.parse(dump);
  if (m_RD.texture.IsNull) throw new InvalidOperationError(Operation.Read, "sprite", "names no atlas");
  if (m_RD.settingsRaw.packingRotation !== UNROTATED_PACKING)
    throw new InvalidOperationError(Operation.Read, "sprite", "is packed rotated, so its rectangle is not its pixels");
  return { atlas: m_RD.texture.Name, rectangle: m_RD.textureRect };
};
