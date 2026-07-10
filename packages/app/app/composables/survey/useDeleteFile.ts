import { AzureContainer } from "@esposter/db-schema";

export const useDeleteFile = (surveyId: MaybeRefOrGetter<string>) => {
  const { $trpc } = useNuxtApp();
  return async (oldDownloadFileSasUrl: string) => {
    const surveyIdValue = toValue(surveyId);
    const pathname = decodeURIComponent(new URL(oldDownloadFileSasUrl).pathname);
    const blobPath = pathname.slice(`/${AzureContainer.ResourceAssets}/${surveyIdValue}/`.length);
    await $trpc.survey.deleteFile.mutate({ blobPath, surveyId: surveyIdValue });
  };
};
