import { router } from "#server/trpc/index";
import { createReadBlobStateProcedure } from "#server/trpc/procedure/blobState/createReadBlobStateProcedure";
import { createSaveBlobStateProcedure } from "#server/trpc/procedure/blobState/createSaveBlobStateProcedure";
import { standardRateLimitedProcedure } from "#server/trpc/procedure/standardRateLimitedProcedure";
import { BuildingMap } from "#shared/assets/clicker/data/BuildingMap";
import { UpgradeMap } from "#shared/assets/clicker/data/upgrades/UpgradeMap";
import { ClickerSave, clickerSaveSchema } from "#shared/models/clicker/data/ClickerSave";
import { saveClickerInputSchema } from "#shared/models/db/clicker/SaveClickerInput";
import { StorageBucket } from "@esposter/db-schema";

export const clickerRouter = router({
  readBuildingMap: standardRateLimitedProcedure
    .meta({ staticReason: "The building table is static data in the code, which no save changes" })
    .query<typeof BuildingMap>(() => BuildingMap),
  readClicker: createReadBlobStateProcedure(StorageBucket.ClickerAssets, ClickerSave, clickerSaveSchema),
  readUpgradeMap: standardRateLimitedProcedure
    .meta({ staticReason: "The upgrade table is static data in the code, which no save changes" })
    .query<typeof UpgradeMap>(() => UpgradeMap),
  saveClicker: createSaveBlobStateProcedure(StorageBucket.ClickerAssets, saveClickerInputSchema),
});
