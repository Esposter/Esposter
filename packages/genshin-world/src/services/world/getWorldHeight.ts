import fontaineGround from "#src/data/fontaine/ground.json";
import inazumaGround from "#src/data/inazuma/ground.json";
import liyueGround from "#src/data/liyue/ground.json";
import natlanGround from "#src/data/natlan/ground.json";
import nodKraiGround from "#src/data/nod-krai/ground.json";
import snezhnayaGround from "#src/data/snezhnaya/ground.json";
import sumeruGround from "#src/data/sumeru/ground.json";
import windriseBaseGround from "#src/data/windrise/base-ground.json";
import { regionGroundSchema } from "#src/models/world/RegionGround";
import { createTerrainShapeHeight } from "genshin-engine";

// The world's one ground: Windrise's hills, fitted to the game's terrain tiles round the oak's foot at the origin
// (`genshin:assets fit windrise`), over the world's base, with every other region's ground raised where its places
// Stand. Each region's features are filed into the same cells, so a point reads only the few near it
export const getWorldHeight = createTerrainShapeHeight({
  ...windriseBaseGround,
  features: [
    fontaineGround,
    inazumaGround,
    liyueGround,
    natlanGround,
    nodKraiGround,
    snezhnayaGround,
    sumeruGround,
  ].flatMap((regionGround) => regionGroundSchema.parse(regionGround).features),
});
