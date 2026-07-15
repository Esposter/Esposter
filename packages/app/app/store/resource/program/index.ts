import type { ProgramResource } from "#shared/models/resource/program/ProgramResource";

import { programResourceSchema } from "#shared/models/resource/program/ProgramResource";

export const useProgramStore = defineStore("program", () => {
  const route = useRoute();
  // The store outlives the page, so the id is read from the route per call rather than captured once
  const { load, readContent, resource, save } = useResource(() =>
    Array.isArray(route.params.id) ? (route.params.id[0] ?? "") : (route.params.id ?? ""),
  );
  const programResource = ref<ProgramResource>(programResourceSchema.parse({}));
  const loadContent = async () => {
    await load();
    // Content is untyped at the cross-type dispatch; this store owns the concrete schema
    const data = (await readContent()) as ProgramResource | undefined;
    programResource.value = data ?? programResourceSchema.parse({});
  };
  const saveProgram = () => save(programResource.value);
  return { loadContent, programResource, resource, saveProgram };
});
