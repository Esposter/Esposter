import type { ExcelMaterialRow } from "#src/models/genshinAssets/stats/ExcelMaterialRow";
import type { ExpMaterial } from "genshin-world";

import { takeOne } from "@esposter/shared";
import { expMaterialSchema } from "genshin-world/definitions";

// Every item of the material table whose use gives EXP under the operation named, with how much EXP one of it gives
export const getExpMaterials = (materialRows: ExcelMaterialRow[], useOp: string): ExpMaterial[] =>
  materialRows.flatMap(({ id, itemUse }) => {
    const expUse = itemUse.find((use) => use.useOp === useOp);
    return expUse ? [expMaterialSchema.parse({ experience: Number(takeOne(expUse.useParam, 0)), id })] : [];
  });
