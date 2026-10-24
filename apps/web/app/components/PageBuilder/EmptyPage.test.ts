// @vitest-environment nuxt
import { TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import PageBuilderEmptyPage from "@/components/PageBuilder/EmptyPage.vue";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test, vi } from "vitest";

describe("pageBuilderEmptyPage", () => {
  test("an empty page offers the palette", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, { content: [], root: TEST_ROOT });
    const component = await mountSuspended(PageBuilderEmptyPage, {
      attachTo: document.body,
      props: {
        announce: vi.fn<(message: string) => void>(),
        getDocument: () => pageBuilderDocumentStore.getDocument(resourceId),
        kind: webpageKind,
        resourceId,
      },
    });

    expect(component.get("h3").text()).toBe("Layout");
    expect(component.findAll("button").filter((button) => button.text() === "Section")).toHaveLength(1);

    component.unmount();
  });
});
