// The files an editor of a survey holds for its session: those the survey referenced when the editor opened, and each
// One uploaded since. The editor's components and its close share them, and none of them owns the set, so it is a store
export const useSurveyFilesStore = defineStore("survey/files", () => {
  const fileUrls = ref(new Set<string>());
  const setFileUrls = (urls: string[]) => {
    fileUrls.value = new Set(urls);
  };
  const addFileUrl = (url: string) => {
    fileUrls.value.add(url);
  };

  return { addFileUrl, fileUrls, setFileUrls };
});
