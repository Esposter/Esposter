import { createContentData } from "@/services/resource/createContentData";
import { createEmptyProgram } from "@/services/resource/program/createEmptyProgram";
import { ResourceType } from "@esposter/db-schema";

export const useProgramStore = defineStore("resource/program", () => {
  const {
    content: programResource,
    loadContent,
    saveContent: saveProgram,
  } = createContentData<ResourceType.Program>(ResourceType.Program, (data) => data ?? createEmptyProgram());
  return { loadContent, programResource, saveProgram };
});
