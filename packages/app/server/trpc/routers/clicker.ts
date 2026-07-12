import { BuildingMap } from "#shared/assets/clicker/data/BuildingMap";
import { UpgradeMap } from "#shared/assets/clicker/data/upgrades/UpgradeMap";
import { ClickerSave, clickerSaveSchema } from "#shared/models/clicker/data/ClickerSave";
import { router } from "@@/server/trpc";
import { createReadBlobStateProcedure } from "@@/server/trpc/procedure/blobState/createReadBlobStateProcedure";
import { createSaveBlobStateProcedure } from "@@/server/trpc/procedure/blobState/createSaveBlobStateProcedure";
import { standardRateLimitedProcedure } from "@@/server/trpc/procedure/standardRateLimitedProcedure";
import { AzureContainer } from "@esposter/db-schema";

export const clickerRouter = router({
  readBuildingMap: standardRateLimitedProcedure.query(() => BuildingMap),
  readClicker: createReadBlobStateProcedure(AzureContainer.ClickerAssets, ClickerSave),
  readUpgradeMap: standardRateLimitedProcedure.query(() => UpgradeMap),
  saveClicker: createSaveBlobStateProcedure(AzureContainer.ClickerAssets, clickerSaveSchema),
});
