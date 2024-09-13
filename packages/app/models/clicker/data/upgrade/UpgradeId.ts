import { CursorUpgradeId } from "@/models/clicker/data/upgrade/CursorUpgradeId";
import { GrandmaUpgradeId } from "@/models/clicker/data/upgrade/GrandmaUpgradeId";
import { mergeObjectsStrict } from "@esposter/shared";
import { z } from "zod";

export const UpgradeId = mergeObjectsStrict(CursorUpgradeId, GrandmaUpgradeId);
export type UpgradeId = CursorUpgradeId | GrandmaUpgradeId;

export const upgradeIdSchema = z.nativeEnum(UpgradeId) satisfies z.ZodType<UpgradeId>;
