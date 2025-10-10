import { AzureContainer } from "@esposter/db";

export const useDeleteFile = (surveyId: string) => {
  const { $trpc } = useNuxtApp();
  return async (oldDownloadFileSasUrl: string) => {
    const pathname = decodeURIComponent(new URL(oldDownloadFileSasUrl).pathname);
    const blobPath = pathname.slice(`/${AzureContainer.SurveyAssets}/${surveyId}/`.length);
    await $trpc.survey.deleteFile.mutate({ blobPath, surveyId });
  };
};
