// @vitest-environment nuxt
import type { BlockDocument } from "headless-block-editor";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_LABEL, TEST_OTHER_ID, TEST_ROOT, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { usePageBuilderHistoryCommands } from "@/composables/pageBuilder/usePageBuilderHistoryCommands";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { useCommandStore } from "@/store/ui/command";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { moveBlockNode } from "headless-block-editor";
import { describe, expect, test } from "vitest";

const createButton = (id: string) => ({
  props: { href: TEST_URL, id, label: TEST_LABEL },
  type: WebpageNodeType.Button,
});

describe(usePageBuilderHistoryCommands, () => {
  test("the command bar names the edit it would undo", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const document: BlockDocument = { content: [createButton(TEST_ID), createButton(TEST_OTHER_ID)], root: TEST_ROOT };
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { loadDocument } = pageBuilderDocumentStore;
    await loadDocument(resourceId, () => Promise.resolve(document));
    const component = await mountSuspended(
      defineComponent({
        setup: () => {
          usePageBuilderHistoryCommands(resourceId);
          return () => h("div");
        },
      }),
    );
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit } = pageBuilderHistoryStore;
    applyEdit(
      resourceId,
      moveBlockNode(document, webpageRegistry, "/content/0", "/content", 1),
      "Move block",
    )._unsafeUnwrap();
    const commandStore = useCommandStore();
    const { commands } = storeToRefs(commandStore);

    expect(commands.value.map(({ id, title }) => ({ id, title }))).toStrictEqual([
      { id: "page-builder-undo", title: "Undo Move block" },
      { id: "page-builder-redo", title: "Redo" },
      { id: "page-builder-redo-y", title: "Redo" },
    ]);

    component.unmount();
  });
});
