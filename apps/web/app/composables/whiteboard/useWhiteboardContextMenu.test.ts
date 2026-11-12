// @vitest-environment nuxt
import type { WhiteboardEditState } from "@/models/whiteboard/WhiteboardEditState";

import { useWhiteboardContextMenu } from "@/composables/whiteboard/useWhiteboardContextMenu";
import {
  createWhiteboardEditState,
  WHITEBOARD_PROCESS,
  WHITEBOARD_PROCESS_ID,
} from "@/services/whiteboard/constants.test";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { useContextMenuStore } from "@/store/ui/contextMenu";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test, vi } from "vitest";

// The menu mounted as a surface, so the stores it writes to and the handler it opens with are read back after the mount
const mountContextMenu = async (editState: Ref<WhiteboardEditState>) => {
  const surface: {
    contextMenu?: ReturnType<typeof useContextMenuStore>;
    editor?: ReturnType<typeof useWhiteboardEditorStore>;
    onOpenContextMenu?: ReturnType<typeof useWhiteboardContextMenu>["onOpenContextMenu"];
  } = {};
  const commands = {
    copy: vi.fn<() => Promise<void>>(),
    cut: vi.fn<() => Promise<void>>(),
    deleteSelection: vi.fn<() => void>(),
    duplicate: vi.fn<() => void>(),
    editText: vi.fn<(elementId: string) => void>(),
    pasteText: vi.fn<(text: string) => void>(),
    selectAll: vi.fn<() => void>(),
  };
  await mountSuspended(
    defineComponent({
      render: () => h("div"),
      setup: () => {
        const contextMenuStore = useContextMenuStore();
        const whiteboardEditorStore = useWhiteboardEditorStore();
        surface.contextMenu = contextMenuStore;
        surface.editor = whiteboardEditorStore;
        surface.onOpenContextMenu = useWhiteboardContextMenu(editState, commands).onOpenContextMenu;
        return () => h("div");
      },
    }),
  );
  return surface as Required<typeof surface>;
};

// The canvas is 500 by 500 at the origin, so its bottom-left corner is empty while the process shape sits at the origin
const setup = async () => {
  const editState = ref(createWhiteboardEditState({ elements: [WHITEBOARD_PROCESS] }));
  const surface = await mountContextMenu(editState);
  surface.editor.setCanvasRect({ height: 500, width: 500, x: 0, y: 0 });
  return surface;
};

const getTitles = (surface: Awaited<ReturnType<typeof setup>>) =>
  surface.contextMenu.contextMenu?.items.map(({ title }) => title);

describe("useWhiteboardContextMenu", () => {
  test("a menu from the keyboard keeps the selection and lists its commands", async () => {
    expect.hasAssertions();
    const surface = await setup();
    surface.editor.selectedIds = [WHITEBOARD_PROCESS_ID];

    surface.onOpenContextMenu({ opener: document.createElement("div"), x: 0, y: 500 }, false);

    expect(surface.editor.selectedIds).toStrictEqual([WHITEBOARD_PROCESS_ID]);
    expect(getTitles(surface)).toContain("Delete");
  });

  test("a menu from a pointer on empty canvas clears the selection and lists the canvas's commands", async () => {
    expect.hasAssertions();
    const surface = await setup();
    surface.editor.selectedIds = [WHITEBOARD_PROCESS_ID];

    surface.onOpenContextMenu({ opener: document.createElement("div"), x: 400, y: 400 }, true);

    expect(surface.editor.selectedIds).toStrictEqual([]);
    expect(getTitles(surface)).toStrictEqual(["Paste", "Select all", "Zoom to fit", "Reset zoom"]);
  });
});
