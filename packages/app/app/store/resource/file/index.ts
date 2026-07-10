import type { FileResource } from "#shared/models/resource/file/FileResource";

import { createDefaultFileResource } from "@/services/resource/file/createDefaultFileResource";
import { useFileHistoryStore } from "@/store/resource/file/history";

export const useFileStore = defineStore("resource/file", () => {
  const route = useRoute();
  // The store outlives the page, so the id is read from the route per call rather than captured once
  const { load, readContent, resource, save } = useResource(() =>
    Array.isArray(route.params.id) ? (route.params.id[0] ?? "") : (route.params.id ?? ""),
  );
  const fileHistoryStore = useFileHistoryStore();
  const { clear } = fileHistoryStore;
  const fileResource = ref<FileResource>(createDefaultFileResource());
  // The grid operates on the data section; settings is the parse configuration the Settings blade edits
  const dataSource = computed(() => fileResource.value.data);
  const settings = computed(() => fileResource.value.settings);
  const loadContent = async () => {
    await load();
    const data = await readContent();
    fileResource.value = (data as FileResource | undefined) ?? createDefaultFileResource();
    // Another resource's commands must not be undoable onto this one
    clear();
  };
  const saveFile = () => save(fileResource.value);
  return { dataSource, fileResource, loadContent, resource, saveFile, settings };
});
