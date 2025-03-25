import { BuildingMap } from "#shared/assets/clicker/data/BuildingMap";
import { UpgradeMap } from "#shared/assets/clicker/data/upgrades/UpgradeMap";
import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { ClickerGame, clickerGameSchema } from "#shared/models/clicker/data/ClickerGame";
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
  readGame: authedProcedure.query<ClickerGame>(async ({ ctx }) => {
    try {
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const response = await useDownload(AzureContainer.ClickerAssets, blobName);
      if (!response.readableStreamBody) return new ClickerGame();

      const json = await streamToText(response.readableStreamBody);
      return Object.assign(new ClickerGame(), jsonDateParse(json));
    } catch {
      return new ClickerGame();
    }
  }),
  readUpgradeMap: rateLimitedProcedure.query(() => UpgradeMap),
  saveGame: authedProcedure.input(clickerGameSchema).mutation(async ({ ctx, input }) => {
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await useUpload(AzureContainer.ClickerAssets, blobName, JSON.stringify(input));
  }),
});
