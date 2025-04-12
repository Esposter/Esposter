import type { Type } from "arktype";

import { CursorUpgradeId } from "#shared/models/clicker/data/upgrade/CursorUpgradeId";
import { GrandmaUpgradeId } from "#shared/models/clicker/data/upgrade/GrandmaUpgradeId";
import { mergeObjectsStrict } from "@esposter/shared";
import { type } from "arktype";

export const UpgradeId = mergeObjectsStrict(CursorUpgradeId, GrandmaUpgradeId);
export type UpgradeId = CursorUpgradeId | GrandmaUpgradeId;

export const upgradeIdSchema = type.valueOf(UpgradeId) satisfies Type<UpgradeId>;
