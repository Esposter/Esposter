import type { ResourceType } from "@esposter/db-schema";

import { programResourceSchema } from "#shared/models/resource/program/ProgramResource";
import { createContentData } from "@/services/resource/createContentData";

export const useProgramStore = defineStore("program", () => {
  const {
    content: programResource,
    loadContent,
    saveContent: saveProgram,
  } = createContentData<ResourceType.Program>((data) => data ?? programResourceSchema.parse({}));
  return { loadContent, programResource, saveProgram };
});
