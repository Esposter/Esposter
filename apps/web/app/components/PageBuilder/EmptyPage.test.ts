// @vitest-environment nuxt
import PageBuilderEmptyPage from "@/components/PageBuilder/EmptyPage.vue";
import { TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test, vi } from "vitest";

describe("pageBuilderEmptyPage", () => {
  test("an empty page offers the palette", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    usePageBuilderDocumentStore().setDocument(resourceId, { content: [], root: TEST_ROOT });
    const component = await mountSuspended(PageBuilderEmptyPage, {
      attachTo: document.body,
      props: { announce: vi.fn<(message: string) => void>(), resourceId },
    });

    expect(component.get("h3").text()).toBe("Layout");
    expect(component.findAll("button").filter((button) => button.text() === "Section")).toHaveLength(1);

    component.unmount();
  });
});
