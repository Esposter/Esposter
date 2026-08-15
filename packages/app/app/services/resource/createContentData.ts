import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { ResourceType } from "@esposter/db-schema";

import { useResourceStore } from "@/store/resource";

// The load/save half every content store shares: hydrate the blade's resource, rebuild the content from its
// Blob, and seed the dirty check so the editor's own load echo compares equal instead of writing back and
// Bumping contentVersion for nothing. `createContent` is the one place a type says what its blob means —
// Called with no data for the empty document a store holds before its first load
export const createContentData = <
  TType extends ResourceType,
  TContent extends ResourceContent<TType> = ResourceContent<TType>,
>(
  createContent: (data?: ResourceContent<TType>) => TContent,
) => {
  const resourceStore = useResourceStore();
  const { readContent, readResource, saveContent: saveResourceContent, setPersistedContent } = resourceStore;
  // Cast avoids the excessively deep UnwrapRef instantiation on content types with nested class members
  const content = ref(createContent()) as Ref<TContent>;
  const loadContent = async () => {
    await readResource();
    content.value = createContent(await readContent<TType>());
    setPersistedContent(content.value);
  };
  const saveContent = () => saveResourceContent(content.value);
  return { content, loadContent, saveContent };
};
