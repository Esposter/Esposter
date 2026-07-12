import type { BoughtBuilding } from "#shared/models/clicker/data/building/BoughtBuilding";
import type { UpgradeId } from "#shared/models/clicker/data/upgrade/UpgradeId";
import type { ItemEntityType, ToData } from "@esposter/shared";

import { boughtBuildingSchema } from "#shared/models/clicker/data/building/BoughtBuilding";
import { buildingIdSchema } from "#shared/models/clicker/data/building/BuildingId";
import { ClickerType, clickerTypeSchema } from "#shared/models/clicker/data/ClickerType";
import { upgradeIdSchema } from "#shared/models/clicker/data/upgrade/UpgradeId";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { createItemEntityTypeSchema, createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export class ClickerSave extends AItemEntity implements ItemEntityType<ClickerType> {
  boughtBuildings: BoughtBuilding[] = [];
  boughtUpgrades: UpgradeId[] = [];
  noPoints = 0;
  type = ClickerType.Default;

  constructor(init?: Partial<ClickerSave>) {
    super();
    Object.assign(this, init);
  }
}

export const clickerSaveSchema = z.object({
  ...aItemEntitySchema.shape,
  ...createItemEntityTypeSchema(clickerTypeSchema).shape,
  boughtBuildings: createUniqueArraySchema(boughtBuildingSchema, "id"),
  boughtUpgrades: createUniqueArraySchema(upgradeIdSchema),
  id: z.uuid(),
  noPoints: z.number(),
}) satisfies z.ZodType<ToData<ClickerSave>>;

// Read-side tolerance: ids are validated per-element and unknown ones (removed content) are
// dropped so a save never fails to load wholesale — content removals self-heal existing saves.
const storedBoughtBuildingsSchema = createUniqueArraySchema(
  z.object({ amount: z.number(), id: z.string(), producedValue: z.number() }),
  "id",
).transform((storedBoughtBuildings) =>
  storedBoughtBuildings.filter(
    (storedBoughtBuilding): storedBoughtBuilding is BoughtBuilding =>
      buildingIdSchema.safeParse(storedBoughtBuilding.id).success,
  ),
);
const toBoughtUpgradeIds = (storedBoughtUpgradeIds: string[]) =>
  storedBoughtUpgradeIds.filter(
    (storedBoughtUpgradeId): storedBoughtUpgradeId is UpgradeId =>
      upgradeIdSchema.safeParse(storedBoughtUpgradeId).success,
  );
const baseStoredClickerSaveShape = {
  ...aItemEntitySchema.shape,
  ...createItemEntityTypeSchema(clickerTypeSchema).shape,
  boughtBuildings: storedBoughtBuildingsSchema,
  id: z.uuid(),
  noPoints: z.number(),
};
// The legacy arm migrates pre-normalization saves that embedded full definition objects by
// extracting only the ids — delete it once existing saves have cycled through a load + re-save.
export const clickerSaveMigrationSchema = z.union([
  z.object({
    ...baseStoredClickerSaveShape,
    boughtUpgrades: createUniqueArraySchema(z.string()).transform(toBoughtUpgradeIds),
  }),
  z.object({
    ...baseStoredClickerSaveShape,
    boughtUpgrades: createUniqueArraySchema(z.object({ id: z.string() }), "id").transform((legacyBoughtUpgrades) =>
      toBoughtUpgradeIds(legacyBoughtUpgrades.map(({ id }) => id)),
    ),
  }),
]) satisfies z.ZodType<ToData<ClickerSave>>;
