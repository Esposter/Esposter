import type { Editor, EditorConfig, ProjectData } from "grapesjs";

import { authClient } from "@/services/auth/authClient";
import { validateFile } from "@/services/file/validateFile";
import { GRAPES_JS_EDITOR_CONTAINER_ID } from "@/services/grapesjs/constants";
import { readUploadFiles } from "@/services/grapesjs/readUploadFiles";
import { useAlertStore } from "@/store/alert";
import { getResultAsync, noop } from "@esposter/shared";
import grapesJS from "grapesjs";

interface UseGrapesJsEditorStorage {
  load: () => Promise<ProjectData>;
  store: (data: ProjectData, editor: Editor) => Promise<unknown>;
}

interface UseGrapesJsEditorAssets {
  upload: (file: File) => Promise<string>;
}

export const useGrapesJsEditor = async (
  storage: UseGrapesJsEditorStorage,
  configuration?: EditorConfig,
  assets?: UseGrapesJsEditorAssets,
) => {
  // https://antfu.me/posts/async-with-composition-api
  const currentInstance = getCurrentInstance();
  const { data: session } = await authClient.useSession(useFetch);
  const { createAlert } = useAlertStore();
  const editor = shallowRef<Editor>();
  // The document stores branch between the authenticated document path and local storage,
  // So a single storage adapter suffices; re-initialize on session change to reload from the right source
  const { stop, trigger } = watchTriggerable(session, () => {
    editor.value?.destroy();
    // The composable's contract keys come after the spread so a caller cannot override them
    const newEditor = grapesJS.init({
      ...configuration,
      // Without an adapter GrapesJS embeds dropped images as base64 into the content blob; with one
      // Every asset is hosted under {id}/files/… and the canvas only ever carries its url
      ...(assets
        ? {
            assetManager: {
              ...configuration?.assetManager,
              uploadFile: async (event) => {
                for (const file of readUploadFiles(event)) {
                  if (!validateFile(file.size)) {
                    useEmptyFileAlert();
                    continue;
                  }

                  await getResultAsync(() => assets.upload(file))
                    .andTee((url) => {
                      newEditor.AssetManager.add(url);
                    })
                    .match(noop, (error) => {
                      createAlert(error.message, "error");
                    });
                }
              },
            },
          }
        : {}),
      container: `#${GRAPES_JS_EDITOR_CONTAINER_ID}`,
      // oxlint-disable-next-line typescript/no-deprecated -- fromElement still functional in GrapesJS; removing it would change initial-load behavior
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
