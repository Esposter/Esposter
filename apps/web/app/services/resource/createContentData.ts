import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { ResourceType } from "@esposter/db-schema";

import { ResourceContentHookMap } from "@/services/resource/ResourceContentHookMap";
import { useResourceStore } from "@/store/resource";

// The load/save half every content store shares: hydrate the blade's resource, rebuild the content from its
// Blob, and seed the dirty check so the editor's own load echo compares equal instead of writing back and
// Bumping contentVersion for nothing. `createContent` is the one place a type says what its blob means —
// Called with no data for the empty document a store holds before its first load
export const createContentData = <
  TType extends ResourceType,
  TContent extends ResourceContent<TType> = ResourceContent<TType>,
>(
  type: TType,
  createContent: (data?: ResourceContent<TType>) => TContent,
) => {
  const resourceStore = useResourceStore();
  const { readContent, readResource, saveContent: saveResourceContent, setPersistedContent } = resourceStore;
  // Cast avoids the excessively deep UnwrapRef instantiation on content types with nested class members
  const content = ref(createContent()) as Ref<TContent>;
  const readContentData = async () => {
    content.value = createContent(await readContent<TType>());
    setPersistedContent(content.value);
  };
  const loadContent = async () => {
    await readResource();
    await readContentData();
  };
  // A restore replaces the working copy underneath whatever blade is open, so the store re-reads its own
  // Content instead of the blade being remounted. The row itself is re-read by the caller that runs this, so
  // The hook is the content half alone
  ResourceContentHookMap.Reload.register(async (reloadedType) => {
    if (reloadedType === type) await readContentData();
  });
  const saveContent = () => saveResourceContent(content.value);
  return { content, loadContent, saveContent };
};
