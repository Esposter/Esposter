import type { ResourceType } from "@esposter/db-schema";

import { programResourceSchema } from "#shared/models/resource/program/ProgramResource";
import { getRouteParamString } from "@/util/router/getRouteParamString";

export const useProgramStore = defineStore("program", () => {
  const route = useRoute();
  // The store outlives the page, so the id is read from the route per call rather than captured once
  const { load, readContent, resource, save, setPersistedContent } = useResource<ResourceType.Program>(() =>
    getRouteParamString(route.params.id),
  );
  const programResource = ref(programResourceSchema.parse({}));
  const loadContent = async () => {
    await load();
    const data = await readContent();
    programResource.value = data ?? programResourceSchema.parse({});
    // Seed the dirty check so the watcher's load echo compares equal instead of writing back
    setPersistedContent(programResource.value);
  };
  const saveProgram = () => save(programResource.value);
  return { loadContent, programResource, resource, saveProgram };
});
