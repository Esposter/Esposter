import type { SurveyDocument } from "vue-survey-engine-headless";

import { validateFileWithAlert } from "#src/services/file/validateFileWithAlert";
import { collectSurveyFileUrls } from "#src/services/resource/survey/collectSurveyFileUrls";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useResourceStore } from "#src/store/resource/index";
import { useSurveyFilesStore } from "#src/store/survey/files";
import { ResourceType } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

// The files of one survey's editor. A file is deleted only when the editor closes and its document no longer references
// It, since an edit the owner undoes would otherwise leave a picture broken. Only a file the editor's session held is
// Ever deleted: one the survey held when the editor opened, or one the session uploaded
export const useSurveyFiles = () => {
  const resourceStore = useResourceStore();
  const { currentResourceId } = storeToRefs(resourceStore);
  const { captureOpeningCheck } = resourceStore;
  const getResourceId = () => currentResourceId.value;
  const uploadFile = useUploadResourceFile(ResourceType.Survey, getResourceId);
  const deleteFile = useDeleteResourceFile(ResourceType.Survey);
  const surveyFilesStore = useSurveyFilesStore();
  const { fileUrls, isClosed } = storeToRefs(surveyFilesStore);
  const { addFileUrl, closeSession, openSession } = surveyFilesStore;
  // The editor is gone by the time a file is deleted, so nothing can alert: each delete logs its own failure, and the
  // Rest still go
  const deleteUrls = (resourceId: string, urls: string[]) => {
    for (const url of urls) deleteFile(resourceId, url);
  };
  // A file is validated before the upload, and a rejected one alerts itself, so the undefined it leaves uploads
  // Nothing. A file belongs to the session it was uploaded in, so one that lands after that session closed, or after
  // The open Resource became another opening, is deleted from the resource it went to and handed back to nothing
  const upload = async (file: File) => {
    if (!validateFileWithAlert(file)) return undefined;

    const resourceId = getResourceId();
    const isStillOpen = captureOpeningCheck();
    const url = await uploadFile(file);
    if (isClosed.value || !isStillOpen()) {
      deleteUrls(resourceId, [url]);
      return undefined;
    }

    addFileUrl(url);
    return url;
  };
  // A picked file is uploaded as it is picked, and its url handed to write once the upload lands. A rejected or failed
  // Upload writes nothing, and a failed one alerts
  const uploadPicked = async (files: File[], write: (url: string) => void) => {
    const [file] = files;
    if (!file) return;

    const uploadResult = await getResultAsync(() => upload(file));
    uploadResult.match((url) => {
      if (url) write(url);
    }, createErrorAlert);
  };
  // Called as the editor opens, with the document it opened on, so the files that document holds are candidates too
  const track = (document: SurveyDocument) => {
    openSession(collectSurveyFileUrls(document));
  };
  const sweep = (document: SurveyDocument) => {
    const referencedUrls = new Set(collectSurveyFileUrls(document));
    const orphanUrls = [...fileUrls.value].filter((url) => !referencedUrls.has(url));
    closeSession();
    deleteUrls(getResourceId(), orphanUrls);
  };

  return { sweep, track, upload, uploadPicked };
};
