import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import {
  ATTACHMENTS_COMMAND_GROUP,
  MAX_ZOOM_SCALE,
  MIN_ZOOM_SCALE,
  ZOOM_SCALE_PER_WHEEL_STEP,
} from "#src/services/message/file/constants";
import { useFileDialogStore } from "#src/store/message/file/dialog";
import { useFileStore } from "#src/store/message/file/index";

// The media viewer's state: the gallery it walks, the picture it zooms and the arrow keys that page it while it is open
export const useFileViewer = () => {
  const fileStore = useFileStore();
  const { getFileUrlMap, getViewableFiles } = fileStore;
  const fileDialogStore = useFileDialogStore();
  const { viewingFileId, viewingRoomId } = storeToRefs(fileDialogStore);
  // The gallery of the room the viewed file's message is in, never the one on screen
  const viewableFiles = computed(() => getViewableFiles(viewingRoomId.value));
  const { isOpen, item: file } = useSingletonDialog(viewingFileId, () =>
    viewableFiles.value.find(({ id }) => id === viewingFileId.value),
  );
  const image = useTemplateRef("image");
  // Cursor is inherited from the frame rather than set here, so the zoom-in/grab affordance stays a binding on an
  // Element panzoom does not also write styles to
  const { isZoomed, panzoom } = usePanZoom(image, {
    cursor: "inherit",
    maxScale: MAX_ZOOM_SCALE,
    minScale: MIN_ZOOM_SCALE,
    panOnlyWhenZoomed: true,
    step: ZOOM_SCALE_PER_WHEEL_STEP,
  });
  const index = computed(() => viewableFiles.value.findIndex(({ id }) => id === viewingFileId.value));
  // Read by id rather than captured when the viewer opened, so the store's refresh sweep re-minting an expiring
  // Presigned read urls reaches a viewer that is still on screen
  const url = computed(() => (file.value ? (getFileUrlMap(viewingRoomId.value)?.get(file.value.id)?.url ?? "") : ""));
  const view = (offset: number) => {
    const nextFile = viewableFiles.value[index.value + offset];
    if (nextFile) viewingFileId.value = nextFile.id;
  };
  // Panzoom claims the wheel itself, so the guard is what leaves a video's own wheel behaviour alone
  const zoom = (event: WheelEvent) => {
    if (!panzoom.value) return;
    const { scale } = panzoom.value.zoomWithWheel(event);
    // Back at the fitted size there is nothing outside the frame to pan into, so an offset dragged in while zoomed
    // Would otherwise strand the image off-centre with no way to bring it back
    if (scale === MIN_ZOOM_SCALE) panzoom.value.pan(0, 0, { force: true });
  };

  watch(viewingFileId, () => {
    panzoom.value?.reset();
  });
  // The set's ends are ends, so the arrows walk it rather than wrap it. Registered only while the viewer is open, so a
  // Keystroke never pages through a gallery nobody is looking at and the shortcuts dialog lists them only then
  useCommands(() =>
    isOpen.value
      ? [
          {
            group: ATTACHMENTS_COMMAND_GROUP,
            id: "previous-attachment",
            meaning: UiIconMeaning.Previous,
            run: () => {
              view(-1);
            },
            shortcut: "arrowleft",
            title: "Previous attachment",
          },
          {
            group: ATTACHMENTS_COMMAND_GROUP,
            id: "next-attachment",
            meaning: UiIconMeaning.Next,
            run: () => {
              view(1);
            },
            shortcut: "arrowright",
            title: "Next attachment",
          },
        ]
      : [],
  );

  return { file, index, isOpen, isZoomed, url, view, viewableFiles, zoom };
};
