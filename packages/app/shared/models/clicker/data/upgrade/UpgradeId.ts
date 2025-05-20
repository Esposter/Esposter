import { CursorUpgradeId } from "#shared/models/clicker/data/upgrade/CursorUpgradeId";
import { GrandmaUpgradeId } from "#shared/models/clicker/data/upgrade/GrandmaUpgradeId";
import { mergeObjectsStrict } from "@esposter/shared";
import { z } from "zod/v4";

export const UpgradeId = mergeObjectsStrict(CursorUpgradeId, GrandmaUpgradeId);
export type UpgradeId = CursorUpgradeId | GrandmaUpgradeId;

export const upgradeIdSchema = z.enum(UpgradeId) satisfies z.ZodType<UpgradeId>;
