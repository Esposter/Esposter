import type { Editor, EditorConfig, ProjectData } from "grapesjs";

import { authClient } from "@/services/auth/authClient";
import { GRAPES_JS_EDITOR_CONTAINER_ID } from "@/services/grapesjs/constants";
import { readUploadFiles } from "@/services/grapesjs/readUploadFiles";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { getResultAsync, noop } from "@esposter/shared";
import grapesJS from "grapesjs";

interface UseGrapesJsEditorAssets {
  upload: (file: File) => Promise<string>;
}

interface UseGrapesJsEditorStorage {
  load: () => Promise<ProjectData>;
  store: (data: ProjectData, editor: Editor) => Promise<unknown>;
}

export const useGrapesJsEditor = async (
  storage: UseGrapesJsEditorStorage,
  configuration?: EditorConfig,
  assets?: UseGrapesJsEditorAssets,
) => {
  // https://antfu.me/posts/async-with-composition-api
  const currentInstance = getCurrentInstance();
  const { data: session } = await authClient.useSession(useFetch);
  const validateFile = useValidateFile();
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
                // The uploads are independent, so they overlap instead of paying each round trip in sequence
                await Promise.all(
                  readUploadFiles(event).map(async (file) => {
                    if (!validateFile(file)) return;

                    await getResultAsync(() => assets.upload(file))
                      .andTee((url) => {
                        newEditor.AssetManager.add(url);
                      })
                      .match(noop, createErrorAlert);
                  }),
                );
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
  onUnmounted(() => {
    stop();
    editor.value?.destroy();
  }, currentInstance);
  return { editor };
};
