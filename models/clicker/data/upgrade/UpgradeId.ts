import { CursorUpgradeId, cursorUpgradeIdSchema } from "@/models/clicker/data/upgrade/CursorUpgradeId";
import { GrandmaUpgradeId, grandmaUpgradeIdSchema } from "@/models/clicker/data/upgrade/GrandmaUpgradeId";
import { mergeObjectsStrict } from "@/util/mergeObjectsStrict";
import { z } from "zod";

export const UpgradeId = mergeObjectsStrict(CursorUpgradeId, GrandmaUpgradeId);
export type UpgradeId = keyof typeof UpgradeId;

export const upgradeIdSchema = z.union([cursorUpgradeIdSchema, grandmaUpgradeIdSchema]) satisfies z.ZodType<UpgradeId>;
