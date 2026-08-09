import type { ResourceType } from "@esposter/db-schema";

import { programResourceSchema } from "#shared/models/resource/program/ProgramResource";
import { useResourceStore } from "@/store/resource";

export const useProgramStore = defineStore("program", () => {
  const resourceStore = useResourceStore();
  const { readContent, readResource, saveContent, setPersistedContent } = resourceStore;
  const programResource = ref(programResourceSchema.parse({}));
  const loadContent = async () => {
    await readResource();
    const data = await readContent<ResourceType.Program>();
    programResource.value = data ?? programResourceSchema.parse({});
    // Seed the dirty check so the watcher's load echo compares equal instead of writing back
    setPersistedContent(programResource.value);
  };
  const saveProgram = () => saveContent(programResource.value);
  return { loadContent, programResource, saveProgram };
});
