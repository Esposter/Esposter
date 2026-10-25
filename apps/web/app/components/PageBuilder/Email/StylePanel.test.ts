// @vitest-environment nuxt
import { TEST_ID, TEST_OTHER_ID, TEST_THIRD_ID } from "#shared/services/pageBuilder/constants.test";
import PageBuilderEmailStylePanel from "@/components/PageBuilder/Email/StylePanel.vue";
import { emailKind } from "@/services/pageBuilder/emailKind";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { MjmlNodeType } from "mjml-blocks";
import { describe, expect, test } from "vitest";

describe("pageBuilderEmailStylePanel", () => {
  const TEXT_CONTENT = { content: [{ content: [{ text: "Hello", type: "text" }], type: "paragraph" }], type: "doc" };
  const createTextDocument = (fontSize: string, rootFontSize: string) => ({
    content: [
      {
        props: {
          children: [
            {
              props: {
                children: [
                  {
                    props: { content: TEXT_CONTENT, "font-size": fontSize, id: TEST_OTHER_ID },
                    type: MjmlNodeType.Text,
                  },
                ],
                id: TEST_THIRD_ID,
              },
              type: MjmlNodeType.Column,
            },
          ],
          id: crypto.randomUUID(),
        },
        type: MjmlNodeType.Section,
      },
    ],
    root: { props: { attributes: { [MjmlNodeType.Text]: { "font-size": rootFontSize } } } },
  });

  test("an email text has no breakpoint or state choice", async () => {
    expect.hasAssertions();

    usePageBuilderDocumentStore().setEmailDocument(TEST_ID, emailKind, createTextDocument("20px", "16px"));
    usePageBuilderCanvasStore().setSelectedNodeId(TEST_ID, TEST_OTHER_ID);

    const component = await mountSuspended(PageBuilderEmailStylePanel, { props: { resourceId: TEST_ID } });
    const labels = component.findAll("label").map((label) => label.text());

    expect(component.text()).not.toContain("Style state");
    expect(component.text()).not.toContain("Hover");
    expect(labels).toStrictEqual(expect.arrayContaining(["padding", "color", "font-family"]));
  });

  test("clearing a field restores the root's default", async () => {
    expect.hasAssertions();

    usePageBuilderDocumentStore().setEmailDocument(TEST_ID, emailKind, createTextDocument("20px", "16px"));
    usePageBuilderCanvasStore().setSelectedNodeId(TEST_ID, TEST_OTHER_ID);

    const component = await mountSuspended(PageBuilderEmailStylePanel, { props: { resourceId: TEST_ID } });
    const getFontSizeInput = () => {
      const forId = component
        .findAll("label")
        .find((label) => label.text() === "font-size")
        ?.attributes("for");
      return component.get<HTMLInputElement>(`#${forId}`);
    };
    const startingPlaceholder = getFontSizeInput().attributes("placeholder");

    await getFontSizeInput().setValue("");

    expect(startingPlaceholder).toBe("20px");
    expect(getFontSizeInput().attributes("placeholder")).toBe("16px");
  });
});
