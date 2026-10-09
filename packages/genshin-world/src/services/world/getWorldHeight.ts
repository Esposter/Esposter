import fontaineGround from "#src/data/fontaine/ground.json";
import inazumaGround from "#src/data/inazuma/ground.json";
import liyueGround from "#src/data/liyue/ground.json";
import natlanGround from "#src/data/natlan/ground.json";
import nodKraiGround from "#src/data/nod-krai/ground.json";
import snezhnayaGround from "#src/data/snezhnaya/ground.json";
import sumeruGround from "#src/data/sumeru/ground.json";
import windriseBaseGround from "#src/data/windrise/base-ground.json";
import { regionGroundSchema } from "#src/models/world/RegionGround";
import { createWorldHeight } from "#src/services/world/createWorldHeight";

// The world's one ground over the data files the package still imports
export const getWorldHeight: (x: number, z: number) => number = createWorldHeight(
  windriseBaseGround,
  [fontaineGround, inazumaGround, liyueGround, natlanGround, nodKraiGround, snezhnayaGround, sumeruGround].map(
    (regionGround) => regionGroundSchema.parse(regionGround),
  ),
);
