// @vitest-environment nuxt
import type { FrameGeometry } from "@/models/pageBuilder/FrameGeometry";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_OTHER_ID, TEST_ROOT, TEST_THIRD_ID } from "#shared/services/pageBuilder/constants.test";
import PageBuilderPalette from "@/components/PageBuilder/Palette.vue";
import UiPalette from "@/components/Ui/Palette/Index.vue";
import { WEBPAGE_NODE_TYPE_TITLE_MAP } from "@/services/pageBuilder/constants";
import { TEST_SECTION_ID, TEST_TEXT_CONTENT } from "@/services/pageBuilder/constants.test";
import { emailKind } from "@/services/pageBuilder/emailKind";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { SurveyNodeType } from "vue-survey-engine-headless";
import { MjmlNodeType } from "mjml-blocks";
import { afterEach, describe, expect, test, vi } from "vitest";

describe("pageBuilderPalette", () => {
  const createFrameGeometry = (): FrameGeometry => ({
    checkIsHorizontalOwner: () => false,
    frameRect: { height: 500, left: 0, top: 0, width: 500 },
    getChildRect: () => undefined,
    getNodeIdAt: () => undefined,
    scale: 1,
  });

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
  ])("the $kindName palette lists each block of its categories with its icon and its title", async ({ kind }) => {
    expect.hasAssertions();
    const component = await mountSuspended(PageBuilderPalette, {
      props: { announce: vi.fn<(message: string) => void>(), getDocument: () => undefined, kind, resourceId: TEST_ID },
    });

    expect(component.findComponent(UiPalette).props("groups")).toStrictEqual(
      kind.paletteCategories.map(({ category, types }) => ({
        items: types.map((type) => ({ icon: kind.icons[type], kind: type, title: kind.titles[type] })),
        title: category,
      })),
    );
  });

  // The webpage has no form nodes, so a survey invite is how a published page collects answers. A survey's input kinds
  // Are the only form nodes there are, and none of them is in the palette's categories
  test("owner browses the webpage editor's nodes", () => {
    expect.hasAssertions();

    const surveyNodeTypes: string[] = Object.values(SurveyNodeType);

    expect(
      webpageKind.paletteCategories
        .flatMap<string>(({ types }) => types)
        .filter((type) => surveyNodeTypes.includes(type)),
    ).toStrictEqual([]);
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

  test("a press on a block starts its palette drag where a frame can take it", async () => {
    expect.hasAssertions();

    const frameGeometry = createFrameGeometry();
    const getFrameGeometry = () => frameGeometry;
    const startPaletteDrag = vi.fn();
    const component = await mountSuspended(PageBuilderPalette, {
      props: {
        announce: vi.fn<(message: string) => void>(),
        getDocument: () => undefined,
        getFrameGeometry,
        kind: webpageKind,
        resourceId: TEST_ID,
        startPaletteDrag,
      },
    });

    await component
      .findAll("button")
      .find((button) => button.text() === WEBPAGE_NODE_TYPE_TITLE_MAP[WebpageNodeType.Text])
      ?.trigger("pointerdown", { button: 0, clientX: 0, clientY: 0 });

    expect(startPaletteDrag).toHaveBeenCalledWith(WebpageNodeType.Text, expect.any(PointerEvent), getFrameGeometry);
  });

  test("a press on a block starts no palette drag where no frame can take it", async () => {
    expect.hasAssertions();

    const startPaletteDrag = vi.fn();
    const component = await mountSuspended(PageBuilderPalette, {
      props: {
        announce: vi.fn<(message: string) => void>(),
        getDocument: () => undefined,
        getFrameGeometry: () => undefined,
        kind: webpageKind,
        resourceId: TEST_ID,
        startPaletteDrag,
      },
    });

    await component
      .findAll("button")
      .find((button) => button.text() === WEBPAGE_NODE_TYPE_TITLE_MAP[WebpageNodeType.Text])
      ?.trigger("pointerdown", { button: 0, clientX: 0, clientY: 0 });

    expect(startPaletteDrag).not.toHaveBeenCalled();
  });

  test("a press on a merge field starts its column's drag where a frame can take it", async () => {
    expect.hasAssertions();

    usePageBuilderDocumentStore().setMergeFieldColumns(TEST_ID, ["first_name"]);
    const frameGeometry = createFrameGeometry();
    const getFrameGeometry = () => frameGeometry;
    const startMergeFieldDrag = vi.fn();
    const component = await mountSuspended(PageBuilderPalette, {
      props: {
        announce: vi.fn<(message: string) => void>(),
        getDocument: () => undefined,
        getFrameGeometry,
        kind: emailKind,
        resourceId: TEST_ID,
        startMergeFieldDrag,
      },
    });

    await component
      .findAll("button")
      .find((button) => button.text() === "first_name")
      ?.trigger("pointerdown", { button: 0, clientX: 0, clientY: 0 });

    expect(startMergeFieldDrag).toHaveBeenCalledWith("first_name", expect.any(PointerEvent), getFrameGeometry);
  });

  // A Column is listed only while a Columns slot is the insertion point, so the palette lists it and nothing else there
  test("the palette lists only the kinds the selection's slot accepts", async () => {
    expect.hasAssertions();

    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(TEST_ID, webpageKind, {
      content: [
        {
          props: {
            children: [
              {
                props: {
                  children: [{ props: { content: TEST_TEXT_CONTENT, id: TEST_THIRD_ID }, type: WebpageNodeType.Text }],
                  id: TEST_OTHER_ID,
                },
                type: WebpageNodeType.Column,
              },
            ],
            id: TEST_SECTION_ID,
          },
          type: WebpageNodeType.Columns,
        },
      ],
      root: TEST_ROOT,
    });
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(TEST_ID, TEST_OTHER_ID);
    const component = await mountSuspended(PageBuilderPalette, {
      props: {
        announce: vi.fn<(message: string) => void>(),
        getDocument: () => pageBuilderDocumentStore.getDocument(TEST_ID),
        kind: webpageKind,
        resourceId: TEST_ID,
      },
    });

    expect(component.findComponent(UiPalette).props("groups")).toStrictEqual([
      {
        items: [
          {
            icon: webpageKind.icons[WebpageNodeType.Column],
            kind: WebpageNodeType.Column,
            title: webpageKind.titles[WebpageNodeType.Column],
          },
        ],
        title: takeOne(webpageKind.paletteCategories, 0).category,
      },
    ]);
  });
});
