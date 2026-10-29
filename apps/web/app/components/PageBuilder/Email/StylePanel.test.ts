// @vitest-environment nuxt
import type { MjmlDocument } from "mjml-blocks";

import { TEST_ID, TEST_OTHER_ID, TEST_THIRD_ID, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import PageBuilderEmailImageUploadField from "@/components/PageBuilder/Email/ImageUploadField.vue";
import PageBuilderEmailStylePanel from "@/components/PageBuilder/Email/StylePanel.vue";
import { emailKind } from "@/services/pageBuilder/emailKind";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { MjmlNodeType } from "mjml-blocks";
import { describe, expect, test } from "vitest";

describe("pageBuilderEmailStylePanel", () => {
  const TEXT_CONTENT = { content: [{ content: [{ text: "a", type: "text" }], type: "paragraph" }], type: "doc" };
  const createTextDocument = (fontSize: string, rootFontSize: string): MjmlDocument => ({
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

    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setEmailDocument(TEST_ID, emailKind, createTextDocument("20px", "16px"));
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(TEST_ID, TEST_OTHER_ID);

    const component = await mountSuspended(PageBuilderEmailStylePanel, { props: { resourceId: TEST_ID } });
    const labels = component.findAll("label").map((label) => label.text());

    expect(component.text()).not.toContain("Style state");
    expect(component.text()).not.toContain("Hover");
    expect(labels).toStrictEqual(expect.arrayContaining(["padding", "color", "font-family"]));
  });

  test("clearing a field restores the root's default", async () => {
    expect.hasAssertions();

    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setEmailDocument(TEST_ID, emailKind, createTextDocument("20px", "16px"));
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(TEST_ID, TEST_OTHER_ID);

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

  test("an uploaded image becomes the image's source", async () => {
    expect.hasAssertions();

    const imageDocument: MjmlDocument = {
      content: [
        {
          props: {
            children: [
              {
                props: {
                  children: [{ props: { alt: "a", id: TEST_OTHER_ID, src: "" }, type: MjmlNodeType.Image }],
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
      root: { props: {} },
    };
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setEmailDocument(TEST_ID, emailKind, imageDocument);
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(TEST_ID, TEST_OTHER_ID);

    const component = await mountSuspended(PageBuilderEmailStylePanel, { props: { resourceId: TEST_ID } });
    component.getComponent(PageBuilderEmailImageUploadField).vm.$emit("update", TEST_URL);
    await nextTick();
    const forId = component
      .findAll("label")
      .find((label) => label.text() === "src")
      ?.attributes("for");

    expect(component.get<HTMLInputElement>(`#${forId}`).element.value).toBe(TEST_URL);
  });
});
