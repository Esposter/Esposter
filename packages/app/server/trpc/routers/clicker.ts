import { BuildingMap } from "#shared/assets/clicker/data/BuildingMap";
import { UpgradeMap } from "#shared/assets/clicker/data/upgrades/UpgradeMap";
import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { Clicker, clickerSchema } from "#shared/models/clicker/data/Clicker";
import { streamToText } from "#shared/util/text/streamToText";
import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { useDownload } from "@@/server/composables/azure/useDownload";
import { useUpload } from "@@/server/composables/azure/useUpload";
import { SAVE_FILENAME } from "@@/server/services/clicker/constants";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { rateLimitedProcedure } from "@@/server/trpc/procedure/rateLimitedProcedure";

export const clickerRouter = router({
  readBuildingMap: rateLimitedProcedure.query(() => BuildingMap),
  readClicker: authedProcedure.query<Clicker>(async ({ ctx }) => {
    try {
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const { readableStreamBody } = await useDownload(AzureContainer.ClickerAssets, blobName);
      if (!readableStreamBody) return new Clicker();

      const json = await streamToText(readableStreamBody);
      return Object.assign(new Clicker(), jsonDateParse(json));
    } catch {
      return new Clicker();
    }
  }),
  readUpgradeMap: rateLimitedProcedure.query(() => UpgradeMap),
  saveClicker: authedProcedure.input(clickerSchema).mutation(async ({ ctx, input }) => {
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await useUpload(AzureContainer.ClickerAssets, blobName, JSON.stringify(input));
  }),
});
