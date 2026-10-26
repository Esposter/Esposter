// @vitest-environment nuxt
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import PageBuilderPalette from "@/components/PageBuilder/Palette.vue";
import UiIcon from "@/components/Ui/Icon.vue";
import { WEBPAGE_NODE_TYPE_TITLE_MAP } from "@/services/pageBuilder/constants";
import { TEST_SECTION_ID } from "@/services/pageBuilder/constants.test";
import { emailKind } from "@/services/pageBuilder/emailKind";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { MjmlNodeType } from "mjml-blocks";
import { afterEach, describe, expect, test, vi } from "vitest";

describe("pageBuilderPalette", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("a palette click still inserts the block", async () => {
    expect.hasAssertions();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(TEST_ID, webpageKind, { content: [], root: TEST_ROOT });
    const announce = vi.fn<(message: string) => void>();
    const component = await mountSuspended(PageBuilderPalette, {
      props: {
        announce,
        getDocument: () => pageBuilderDocumentStore.getDocument(TEST_ID),
        kind: webpageKind,
        resourceId: TEST_ID,
      },
    });

    await component
      .findAll("button")
      .find((button) => button.text() === WEBPAGE_NODE_TYPE_TITLE_MAP[WebpageNodeType.Text])
      ?.trigger("click");

    expect(pageBuilderDocumentStore.getDocument(TEST_ID)?.content.map(({ type }) => type)).toStrictEqual([
      WebpageNodeType.Text,
    ]);
  });

  test.each([
    { kind: webpageKind, kindName: "webpage" },
    { kind: emailKind, kindName: "email" },
  ])("the $kindName palette draws each block as a tile with its icon and its title", async ({ kind }) => {
    expect.hasAssertions();
    const component = await mountSuspended(PageBuilderPalette, {
      props: { announce: vi.fn<(message: string) => void>(), getDocument: () => undefined, kind, resourceId: TEST_ID },
    });
    const types = kind.paletteCategories.flatMap<string>((category) => category.types);

    expect(component.findAll("button").map((button) => button.text())).toStrictEqual(
      types.map((type) => kind.titles[type]),
    );
    expect(component.findAllComponents(UiIcon).map((icon) => icon.props("meaning"))).toStrictEqual(
      types.map((type) => kind.icons[type]),
    );
  });

  test("a merge field inserts a text carrying its column's token into the selected column", async () => {
    expect.hasAssertions();

    const columnId = crypto.randomUUID();
    const insertedId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setEmailDocument(TEST_ID, emailKind, {
      content: [
        {
          props: {
            children: [{ props: { children: [], id: columnId }, type: MjmlNodeType.Column }],
            id: TEST_SECTION_ID,
          },
          type: MjmlNodeType.Section,
        },
      ],
      root: { props: {} },
    });
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(TEST_ID, columnId);
    const { setMergeFieldColumns } = pageBuilderDocumentStore;
    setMergeFieldColumns(TEST_ID, ["first_name"]);
    const component = await mountSuspended(PageBuilderPalette, {
      props: {
        announce: vi.fn<(message: string) => void>(),
        getDocument: () => pageBuilderDocumentStore.getEmailDocument(TEST_ID),
        kind: emailKind,
        resourceId: TEST_ID,
      },
    });

    vi.spyOn(crypto, "randomUUID").mockReturnValueOnce(insertedId);
    await component
      .findAll("button")
      .find((button) => button.text() === "first_name")
      ?.trigger("click");

    expect(pageBuilderDocumentStore.getEmailDocument(TEST_ID)?.content).toStrictEqual([
      {
        props: {
          children: [
            {
              props: {
                children: [
                  {
                    props: {
                      content: {
                        content: [{ content: [{ text: "{{first_name}}", type: "text" }], type: "paragraph" }],
                        type: "doc",
                      },
                      id: insertedId,
                    },
                    type: MjmlNodeType.Text,
                  },
                ],
                id: columnId,
              },
              type: MjmlNodeType.Column,
            },
          ],
          id: TEST_SECTION_ID,
        },
        type: MjmlNodeType.Section,
      },
    ]);
  });
});
