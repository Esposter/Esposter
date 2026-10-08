import type { ExcelMaterialRow } from "#src/models/genshinAssets/stats/ExcelMaterialRow";
import type { ArtifactExpMaterial } from "genshin-world";

import { ARTIFACT_EXP_ITEM_USE } from "#src/services/genshinAssets/stats/constants";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { takeOne } from "@esposter/shared";
import { artifactExpMaterialSchema } from "genshin-world";

// Every item the game takes into an artifact as EXP, with how much EXP one of it adds before the enhancement's bonus
export const getArtifactExpMaterials = (): ArtifactExpMaterial[] =>
  readExcelTable<ExcelMaterialRow>("MaterialExcelConfigData").flatMap(({ id, itemUse = [] }) => {
    const expUse = itemUse.find(({ useOp }) => useOp === ARTIFACT_EXP_ITEM_USE);
    return expUse ? [artifactExpMaterialSchema.parse({ experience: Number(takeOne(expUse.useParam, 0)), id })] : [];
  });
