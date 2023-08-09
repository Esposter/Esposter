import { AzureContainer } from "@/models/azure/blob";
import { SurveyerConfiguration, surveyerConfigurationSchema } from "@/models/surveyer/SurveyerConfiguration";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure";
import { getContainerClient, uploadBlockBlob } from "@/services/azure/blob";
import { SAVE_FILENAME } from "@/services/clicker/constants";
import { jsonDateParse } from "@/utils/json";
import { streamToText } from "@/utils/text";

export const surveyerRouter = router({
  readSurveyer: authedProcedure.query<SurveyerConfiguration>(async ({ ctx }) => {
    try {
      const containerClient = await getContainerClient(AzureContainer.SurveyerAssets);
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const response = await blockBlobClient.download();
      if (!response.readableStreamBody) return [];
      return jsonDateParse(await streamToText(response.readableStreamBody));
    } catch {
      // We need to catch the case where the user is reading for the very first time
      // and there is no surveyer configuration saved yet
      return [];
    }
  }),
  saveSurveyer: authedProcedure.input(surveyerConfigurationSchema).mutation(async ({ input, ctx }) => {
    const client = await getContainerClient(AzureContainer.SurveyerAssets);
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await uploadBlockBlob(client, blobName, JSON.stringify(input));
  }),
});
