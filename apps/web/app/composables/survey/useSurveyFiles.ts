import type { SurveyDocument } from "headless-survey-engine";

import { collectSurveyFileUrls } from "@/services/resource/survey/collectSurveyFileUrls";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { useResourceStore } from "@/store/resource";
import { useSurveyFilesStore } from "@/store/survey/files";
import { ResourceType } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// The files of one survey's editor. A file is deleted only when the editor closes and its document no longer references
// It, since an edit the owner undoes would otherwise leave a picture broken. Only a file the editor's session held is
// Ever deleted: one the survey held when the editor opened, or one the session uploaded
export const useSurveyFiles = () => {
  const validateFile = useValidateFile();
  const resourceStore = useResourceStore();
  const getResourceId = () => resourceStore.currentResourceId;
  const uploadFile = useUploadResourceFile(ResourceType.Survey, getResourceId);
  const deleteFile = useDeleteResourceFile(ResourceType.Survey, getResourceId);
  const surveyFilesStore = useSurveyFilesStore();
  const { fileUrls, isClosed } = storeToRefs(surveyFilesStore);
  const { addFileUrl, closeSession, openSession } = surveyFilesStore;
  // The editor is gone by the time a file is deleted, so nothing can alert: a file that fails to delete is logged, and the
  // Rest still go
  const deleteUrls = (urls: string[]) =>
    getResultAsync(() => Promise.all(urls.map((url) => deleteFile(url)))).match(noop, console.error);
  // A file is validated before the upload, and a rejected one alerts itself, so the undefined it leaves uploads nothing.
  // A file that lands after the editor closed is deleted at once, since the close has already swept, and is handed back
  // To nothing
  const upload = async (file: File) => {
    if (!validateFile(file)) return undefined;

    const url = await uploadFile(file);
    if (isClosed.value) {
      await deleteUrls([url]);
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
  const sweep = async (document: SurveyDocument) => {
    const referencedUrls = new Set(collectSurveyFileUrls(document));
    const orphanUrls = [...fileUrls.value].filter((url) => !referencedUrls.has(url));
    closeSession();
    await deleteUrls(orphanUrls);
  };

  return { sweep, track, upload, uploadPicked };
};
