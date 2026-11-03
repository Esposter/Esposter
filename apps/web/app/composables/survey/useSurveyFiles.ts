import type { SurveyDocument } from "survey-engine";

import { collectSurveyFileUrls } from "@/services/resource/survey/collectSurveyFileUrls";
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
  const { fileUrls } = storeToRefs(surveyFilesStore);
  const { addFileUrl, setFileUrls } = surveyFilesStore;
  // A file is validated before the upload, and a rejected one alerts itself, so the undefined it leaves uploads nothing
  const upload = async (file: File) => {
    if (!validateFile(file)) return undefined;

    const url = await uploadFile(file);
    addFileUrl(url);
    return url;
  };
  // Called as the editor opens, with the document it opened on, so the files that document holds are candidates too
  const track = (document: SurveyDocument) => {
    setFileUrls(collectSurveyFileUrls(document));
  };
  const sweep = async (document: SurveyDocument) => {
    const referencedUrls = new Set(collectSurveyFileUrls(document));
    const orphanUrls = [...fileUrls.value].filter((url) => !referencedUrls.has(url));
    setFileUrls([]);
    // The editor is gone by now, so nothing can alert: a file that fails to delete is logged, and the rest still go
    await getResultAsync(() => Promise.all(orphanUrls.map((url) => deleteFile(url)))).match(noop, console.error);
  };

  return { sweep, track, upload };
};
