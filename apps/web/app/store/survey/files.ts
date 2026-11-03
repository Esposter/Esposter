// The files an editor of a survey holds for its session: those the survey referenced when the editor opened, and each
// One uploaded since. The editor's components and its close share them, and none of them owns the set, so it is a store
export const useSurveyFilesStore = defineStore("survey/files", () => {
  const fileUrls = ref(new Set<string>());
  // Set when the editor closes, since the close ends the session: a file that lands after it has no session to be held by
  const isClosed = ref(false);
  const openSession = (urls: string[]) => {
    fileUrls.value = new Set(urls);
    isClosed.value = false;
  };
  const closeSession = () => {
    fileUrls.value = new Set();
    isClosed.value = true;
  };
  const addFileUrl = (url: string) => {
    fileUrls.value.add(url);
  };

  return { addFileUrl, closeSession, fileUrls, isClosed, openSession };
});
