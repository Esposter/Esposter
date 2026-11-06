// @vitest-environment nuxt
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_OTHER_ID, TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { usePageBuilderKeyCommands } from "@/composables/pageBuilder/usePageBuilderKeyCommands";
import { LAST_IN_SLOT_MESSAGE } from "@/services/pageBuilder/constants";
import { TEST_ROOT_TEXT_ID, TEST_TEXT_CONTENT } from "@/services/pageBuilder/constants.test";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { useCommandStore } from "@/store/ui/command";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test, vi } from "vitest";

describe(usePageBuilderKeyCommands, () => {
  test("with no node selected, only paste is bound, so the selection's keys are not listed", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, { content: [], root: TEST_ROOT });
    await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () =>
          usePageBuilderKeyCommands(
            webpageKind,
            () => pageBuilderDocumentStore.getDocument(resourceId),
            () => resourceId,
            vi.fn<(message: string) => void>(),
            ref(false),
          ),
      }),
    );
    const commandStore = useCommandStore();
    const { commands } = storeToRefs(commandStore);

    expect(commands.value.map(({ id }) => id)).toStrictEqual(["page-builder-paste"]);
  });

  test("a node's delete that asks holds the editor's keys until it answers", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [
        { props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text },
        { props: { content: TEST_TEXT_CONTENT, id: TEST_OTHER_ID }, type: WebpageNodeType.Text },
      ],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ROOT_TEXT_ID);
    const isDeleteOpen = ref(true);
    await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () =>
          usePageBuilderKeyCommands(
            webpageKind,
            () => pageBuilderDocumentStore.getDocument(resourceId),
            () => resourceId,
            vi.fn<(message: string) => void>(),
            isDeleteOpen,
          ),
      }),
    );

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Delete" }));

    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content.map(({ props }) => props.id)).toStrictEqual([
      TEST_ROOT_TEXT_ID,
      TEST_OTHER_ID,
    ]);

    isDeleteOpen.value = false;
    await nextTick();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Delete" }));

    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content.map(({ props }) => props.id)).toStrictEqual([
      TEST_OTHER_ID,
    ]);
  });

  test("a move the selection cannot take is listed unavailable with its reason, and one it can take is not", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, {
      content: [
        { props: { content: TEST_TEXT_CONTENT, id: TEST_ROOT_TEXT_ID }, type: WebpageNodeType.Text },
        { props: { content: TEST_TEXT_CONTENT, id: TEST_OTHER_ID }, type: WebpageNodeType.Text },
      ],
      root: TEST_ROOT,
    });
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_OTHER_ID);
    await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () =>
          usePageBuilderKeyCommands(
            webpageKind,
            () => pageBuilderDocumentStore.getDocument(resourceId),
            () => resourceId,
            vi.fn<(message: string) => void>(),
            ref(false),
          ),
      }),
    );
    const commandStore = useCommandStore();
    const { commands } = storeToRefs(commandStore);
    const moveDown = commands.value.find(({ id }) => id === "page-builder-move-down");
    const moveUp = commands.value.find(({ id }) => id === "page-builder-move-up");

    expect([moveDown?.description, moveDown?.isDisabled, moveUp?.description, moveUp?.isDisabled]).toStrictEqual([
      LAST_IN_SLOT_MESSAGE,
      true,
      undefined,
      false,
    ]);
  });
});
