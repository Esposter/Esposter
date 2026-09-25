import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { ResourceType } from "@esposter/db-schema";

import { ResourceContentHookMap } from "@/services/resource/ResourceContentHookMap";
import { useResourceStore } from "@/store/resource";

// The load/save half every content store shares: rebuild the content from the open resource's blob, and seed
// The dirty check so the editor's own load echo compares equal instead of writing back and bumping
// ContentVersion for nothing. `createContent` is the one place a type says what its blob means — called with
// No data for the empty document a store holds before its first load
export const createContentData = <
  TType extends ResourceType,
  TContent extends ResourceContent<TType> = ResourceContent<TType>,
>(
  type: TType,
  createContent: (data?: ResourceContent<TType>) => TContent,
) => {
  const resourceStore = useResourceStore();
  const { checkIsContentRead, readContent, saveContent: saveResourceContent, setPersistedContent } = resourceStore;
  // Cast avoids the excessively deep UnwrapRef instantiation on content types with nested class members
  const content = ref(createContent()) as Ref<TContent>;
  const readContentData = () =>
    readContent<TType>((data) => {
      content.value = createContent(data);
      setPersistedContent(content.value);
    });
  // The page has already read the resource row, so a blade mounting over content it holds renders at once
  const loadContent = async () => {
    if (checkIsContentRead()) return;
    await readContentData();
  };
  // The row itself is re-read by the caller that runs this, so the hook is the content half alone
  ResourceContentHookMap.Reload.register(async (reloadedType) => {
    if (reloadedType === type) await readContentData();
  });
  const saveContent = () => saveResourceContent(content.value);
  return { content, loadContent, saveContent };
};
