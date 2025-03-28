import { CursorUpgradeId } from "#shared/models/clicker/data/upgrade/CursorUpgradeId";
import { GrandmaUpgradeId } from "#shared/models/clicker/data/upgrade/GrandmaUpgradeId";
import { mergeObjectsStrict } from "@esposter/shared";
import { z } from "zod";

export const UpgradeId = mergeObjectsStrict(CursorUpgradeId, GrandmaUpgradeId);
export type UpgradeId = CursorUpgradeId | GrandmaUpgradeId;

export const upgradeIdSchema = z.nativeEnum(UpgradeId) as const satisfies z.ZodType<UpgradeId>;
