import type { ExcelMaterialRow } from "#src/models/genshinAssets/stats/ExcelMaterialRow";
import type { ExpMaterial } from "genshin-world";

import { MATERIAL_TABLE_NAME } from "#src/services/genshinAssets/items/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { takeOne } from "@esposter/shared";
import { expMaterialSchema } from "genshin-world";

// Every item of the material table whose use gives EXP under the operation named, with how much EXP one of it gives
export const getExpMaterials = (useOp: string): ExpMaterial[] =>
  readExcelTable<ExcelMaterialRow>(MATERIAL_TABLE_NAME).flatMap(({ id, itemUse }) => {
    const expUse = itemUse.find((use) => use.useOp === useOp);
    return expUse ? [expMaterialSchema.parse({ experience: Number(takeOne(expUse.useParam, 0)), id })] : [];
  });

// Largest EXP first, the order a level is raised with its materials in
export const compareExperienceDescending = (first: ExpMaterial, second: ExpMaterial): number =>
  second.experience - first.experience;
