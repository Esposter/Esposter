import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";

export const useDeleteFile = (surveyId: string) => {
  const { $trpc } = useNuxtApp();
  return async (oldDownloadFileSasUrl: string) => {
    const pathname = decodeURIComponent(new URL(oldDownloadFileSasUrl).pathname);
    const blobPath = pathname.substring(`/${AzureContainer.SurveyerAssets}/${surveyId}/`.length);
    await $trpc.survey.deleteFile.mutate({ blobPath, surveyId });
  };
};
