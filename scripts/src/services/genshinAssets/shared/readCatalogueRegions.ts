import { CATALOGUE_PATH } from "#src/services/genshinAssets/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { catalogueSchema } from "genshin-world";
import { readFile } from "node:fs/promises";

// Every region of the game's catalogue as the fit wrote it, with each area's outline
export const readCatalogueRegions = async () =>
  catalogueSchema.parse(parseMachineJson(await readFile(CATALOGUE_PATH, "utf8"))).regions;
