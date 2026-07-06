import type { Editor, EditorConfig, ProjectData } from "grapesjs";

import { authClient } from "@/services/auth/authClient";
import { GRAPES_JS_EDITOR_CONTAINER_ID } from "@/services/grapesjs/constants";
import grapesJS from "grapesjs";

interface UseGrapesJsEditorStorage {
  load: () => Promise<ProjectData>;
  store: (data: ProjectData, editor: Editor) => Promise<unknown>;
}

export const useGrapesJsEditor = async (storage: UseGrapesJsEditorStorage, configuration?: EditorConfig) => {
  // https://antfu.me/posts/async-with-composition-api
  const currentInstance = getCurrentInstance();
  const { data: session } = await authClient.useSession(useFetch);
  const editor = shallowRef<Editor>();
  // The document stores branch between the authenticated document path and local storage,
  // So a single storage adapter suffices; re-initialize on session change to reload from the right source
  const { stop, trigger } = watchTriggerable(session, () => {
    editor.value?.destroy();
    // The composable's contract keys come after the spread so a caller cannot override them
    const newEditor = grapesJS.init({
      ...configuration,
      container: `#${GRAPES_JS_EDITOR_CONTAINER_ID}`,
      fromElement: true,
      height: "100%",
      storageManager: {
        type: "document",
      },
    });
    newEditor.Storage.add("document", {
      load: () => storage.load(),
      store: (data) => storage.store(data, newEditor),
    });
    editor.value = newEditor;
  });

  onMounted(() => {
    trigger();
  }, currentInstance);
  // The watcher is registered after an await, so the component scope cannot auto-stop it
  onUnmounted(() => {
    stop();
    editor.value?.destroy();
  }, currentInstance);
  return { editor };
};
