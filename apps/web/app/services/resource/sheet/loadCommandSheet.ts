import { useResourceStore } from "#src/store/resource/index";
import { useSheetStore } from "#src/store/resource/sheet/index";

// The sheet a command bar import or export acts on: its id is named before the first await, so a dialog opens for the
// Sheet the command was run on, and its content is loaded, since the command bar is reachable from any blade
export const loadCommandSheet = async (): Promise<string> => {
  const resourceStore = useResourceStore();
  const { currentResourceId } = storeToRefs(resourceStore);
  const resourceId = currentResourceId.value;
  const sheetStore = useSheetStore();
  const { loadContent } = sheetStore;
  await loadContent();
  return resourceId;
};
