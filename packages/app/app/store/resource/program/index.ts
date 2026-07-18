import type { ProgramResource } from "#shared/models/resource/program/ProgramResource";

import { programResourceSchema } from "#shared/models/resource/program/ProgramResource";
import { getRouteParamString } from "@/util/router/getRouteParamString";

export const useProgramStore = defineStore("program", () => {
  const route = useRoute();
  // The store outlives the page, so the id is read from the route per call rather than captured once
  const { load, readContent, resource, save, setPersistedContent } = useResource(() =>
    getRouteParamString(route.params.id),
  );
  const programResource = ref<ProgramResource>(programResourceSchema.parse({}));
  const loadContent = async () => {
    await load();
    // Content is untyped at the cross-type dispatch; this store owns the concrete schema
    const data = (await readContent()) as ProgramResource | undefined;
    programResource.value = data ?? programResourceSchema.parse({});
    // Seed the dirty check so the watcher's load echo compares equal instead of writing back
    setPersistedContent(programResource.value);
  };
  const saveProgram = () => save(programResource.value);
  return { loadContent, programResource, resource, saveProgram };
});
