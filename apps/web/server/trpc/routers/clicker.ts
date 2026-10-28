import { router } from "#server/trpc";
import { createReadBlobStateProcedure } from "#server/trpc/procedure/blobState/createReadBlobStateProcedure";
import { createSaveBlobStateProcedure } from "#server/trpc/procedure/blobState/createSaveBlobStateProcedure";
import { standardRateLimitedProcedure } from "#server/trpc/procedure/standardRateLimitedProcedure";
import { BuildingMap } from "#shared/assets/clicker/data/BuildingMap";
import { UpgradeMap } from "#shared/assets/clicker/data/upgrades/UpgradeMap";
import { ClickerSave } from "#shared/models/clicker/data/ClickerSave";
import { saveClickerInputSchema } from "#shared/models/db/clicker/SaveClickerInput";
import { AzureContainer } from "@esposter/db-schema";

export const clickerRouter = router({
  readBuildingMap: standardRateLimitedProcedure.query<typeof BuildingMap>(() => BuildingMap),
  readClicker: createReadBlobStateProcedure(AzureContainer.ClickerAssets, ClickerSave),
  readUpgradeMap: standardRateLimitedProcedure.query<typeof UpgradeMap>(() => UpgradeMap),
  // oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- BuildingId, ClickerType, CursorUpgradeId and GrandmaUpgradeId are the same declarations the ClickerSave schema names (ClickerSave.ts:7); the rule flags a nested zod shape even on an exact enum match
  saveClicker: createSaveBlobStateProcedure(AzureContainer.ClickerAssets, saveClickerInputSchema),
});
