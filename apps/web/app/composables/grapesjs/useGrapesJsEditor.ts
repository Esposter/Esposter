import type { ResourceType } from "@esposter/db-schema";
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
  type: ResourceType,
  storage: UseGrapesJsEditorStorage,
  configuration?: EditorConfig,
  assets?: UseGrapesJsEditorAssets,
) => {
  // https://antfu.me/posts/async-with-composition-api
  const currentInstance = getCurrentInstance();
  const editor = shallowRef<Editor>();
  // Before the await, for the same reason the instance is captured there: this composable is a plain async
  // Function, so nothing past the first await still has the caller's scope to hang a teardown on — and an
  // Adopter that outlives its blade holds a destroyed editor.
  // GrapesJS owns the live project once it has loaded, so a restore has to be handed to it: left holding the
  // Pre-restore project its next storage tick writes that project back at the restore's own fresh
  // `contentVersion`. `load()` re-runs the storage adapter below, which hands over what the content store's own
  // Reload stage just re-read. Cleared, because the undo stack and the dirty counter it carries describe a
  // Document that is gone
  useAdoptResourceContent(type, async () => {
    await editor.value?.load(undefined, { clear: true });
  });
  const { data: session } = await authClient.useSession(useFetch);
  const validateFile = useValidateFile();
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
      storageManager: { type: "document" },
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
