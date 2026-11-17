// @vitest-environment nuxt
import type { ImageNode } from "#shared/models/pageBuilder/ImageNode";
import type { VideoNode } from "#shared/models/pageBuilder/VideoNode";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { ResourceFile } from "#shared/models/resource/ResourceFile";
import type { EmailDocument } from "#src/models/pageBuilder/EmailDocument";
import type { ResourcePublicationInResource } from "@esposter/db-schema";
import type { MjmlColumnNode } from "mjml-blocks";

import { ButtonTarget } from "#shared/models/pageBuilder/ButtonTarget";
import { EmailNodeType } from "#shared/models/pageBuilder/EmailNodeType";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { MAX_FILE_REQUEST_SIZE } from "#shared/services/app/constants";
import { NO_SURVEY_ID, PLACEHOLDER_MEDIA_URL } from "#shared/services/pageBuilder/constants";
import {
  createTestImageNode,
  TEST_CONTEXT,
  TEST_ID,
  TEST_LABEL,
  TEST_OTHER_ID,
  TEST_ROOT,
  TEST_THIRD_ID,
  TEST_URL,
} from "#shared/services/pageBuilder/constants.test";
import { webpageDocumentSchema } from "#shared/services/pageBuilder/webpageDocumentSchema";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import PageBuilderContentPanel from "#src/components/PageBuilder/ContentPanel.vue";
import PageBuilderFilePicker from "#src/components/PageBuilder/FilePicker/Index.vue";
import PageBuilderMediaField from "#src/components/PageBuilder/MediaField.vue";
import ResourceLinkSelect from "#src/components/Resource/Link/Select.vue";
import UiFileField from "#src/components/Ui/FileField.vue";
import UiSchemaForm from "#src/components/Ui/SchemaForm/Index.vue";
import UiSelect from "#src/components/Ui/Select/Index.vue";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { TEST_EMAIL, TEST_NESTED_TEXT_ID } from "#src/services/pageBuilder/constants.test";
import { emailKind } from "#src/services/pageBuilder/emailKind";
import { renderCanvasVNodes } from "#src/services/pageBuilder/renderCanvasVNodes";
import { webpageKind } from "#src/services/pageBuilder/webpageKind";
import { getUnpublishedResourceMessage } from "#src/services/resource/getUnpublishedResourceMessage";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useAlertStore } from "#src/store/alert";
import { usePageBuilderCanvasStore } from "#src/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "#src/store/pageBuilder/document";
import { createEmptyPage, ResourceType } from "@esposter/db-schema";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises, mount } from "@vue/test-utils";
import { MjmlNodeType } from "mjml-blocks";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test, vi } from "vitest";

const createButtonDocument = (): WebpageDocument => ({
  content: [
    {
      props: { elementId: "", href: TEST_URL, id: TEST_ID, label: TEST_LABEL, target: ButtonTarget.SameTab },
      type: WebpageNodeType.Button,
    },
  ],
  root: TEST_ROOT,
});
const createSurveyInviteDocument = (surveyId: string): WebpageDocument => ({
  content: [{ props: { elementId: "", id: TEST_ID, label: TEST_LABEL, surveyId }, type: WebpageNodeType.SurveyInvite }],
  root: TEST_ROOT,
});
// An email's invite sits in a column, as the email's document schema requires
const createPublication = (resourceId: string): ResourcePublicationInResource => ({
  createdAt: new Date(0),
  deletedAt: null,
  publishedAt: new Date(0),
  publishedContentVersion: 0,
  publishVersion: 1,
  resourceId,
  updatedAt: new Date(0),
});
// An email's leaf block sits in a column of a section
const createEmailLeafDocument = (leaf: MjmlColumnNode["props"]["children"][number]): EmailDocument => ({
  content: [
    {
      props: {
        children: [{ props: { children: [leaf], id: TEST_OTHER_ID }, type: MjmlNodeType.Column }],
        id: TEST_THIRD_ID,
      },
      type: MjmlNodeType.Section,
    },
  ],
  root: { props: { lang: "", title: "" } },
});
const createEmailSurveyInviteDocument = (surveyId: string): EmailDocument =>
  createEmailLeafDocument({ props: { id: TEST_ID, label: TEST_LABEL, surveyId }, type: EmailNodeType.SurveyInvite });

// An email's button, whose form edits its label
const createEmailButtonDocument = (content: string): EmailDocument =>
  createEmailLeafDocument({ props: { content, id: TEST_ID }, type: MjmlNodeType.Button });

const { uploadFileMock } = vi.hoisted(() => ({ uploadFileMock: vi.fn<(file: File) => Promise<string>>() }));

mockNuxtImport("useUploadResourceFile", () => () => uploadFileMock);

const createFile = (mimetype: string, size?: number) => {
  const file = new File([""], "a", { type: mimetype });
  if (size !== undefined) Object.defineProperty(file, "size", { value: size });
  return file;
};
const createVideoNode = (src: string): VideoNode => ({
  props: { elementId: "", id: TEST_OTHER_ID, src, title: TEST_LABEL },
  type: WebpageNodeType.Video,
});
// The panel of a selected media node, mounted over a document that holds it alone
const mountMediaPanel = async (resourceId: string, node: ImageNode | VideoNode) => {
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  pageBuilderDocumentStore.setDocument(resourceId, webpageKind, { content: [node], root: TEST_ROOT });
  const pageBuilderCanvasStore = usePageBuilderCanvasStore();
  pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_OTHER_ID);

  const component = await mountSuspended(PageBuilderContentPanel, { props: { kind: webpageKind, resourceId } });
  await flushPromises();
  return component;
};
const getMediaSource = (resourceId: string) => {
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const { getDocument } = pageBuilderDocumentStore;
  const node = getDocument(resourceId)?.content[0];
  return node && "src" in node.props ? node.props.src : undefined;
};

describe("pageBuilderContentPanel", () => {
  const { trpcMsw } = setupMswTrpc();
  // The picker reads the resource's files as it mounts, so each test answers that read with none unless it says otherwise
  beforeEach(() => {
    uploadFileMock.mockReset();
    trpcMsw.webpage.readResourceFiles.query(() => []);
  });

  test("editing a button's label in the content panel shows on the canvas", async () => {
    expect.hasAssertions();

    const resourceId = v7();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, createButtonDocument());
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ID);
    const component = await mountSuspended(PageBuilderContentPanel, { props: { kind: webpageKind, resourceId } });

    component.getComponent(UiSchemaForm).vm.$emit("update:modelValue", { href: TEST_URL, label: "a" });

    const document = webpageDocumentSchema.parse(pageBuilderDocumentStore.getDocument(resourceId));

    expect(document.content).toStrictEqual([
      {
        props: { elementId: "", href: TEST_URL, id: TEST_ID, label: "a", target: ButtonTarget.SameTab },
        type: WebpageNodeType.Button,
      },
    ]);
    const canvas = mount(
      defineComponent({ render: () => h("div", renderCanvasVNodes(webpageKind, document, TEST_CONTEXT)) }),
    );

    expect(canvas.text()).toBe("a");

    canvas.unmount();
    component.unmount();
  });

  test("an invalid label is not applied", async () => {
    expect.hasAssertions();

    const resourceId = v7();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, createButtonDocument());
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ID);
    const component = await mountSuspended(PageBuilderContentPanel, { props: { kind: webpageKind, resourceId } });

    component.getComponent(UiSchemaForm).vm.$emit("update:modelValue", { href: TEST_URL, label: "" });

    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content).toStrictEqual(createButtonDocument().content);

    component.unmount();
  });

  test("editing an email button's label in the Content panel changes the email", async () => {
    expect.hasAssertions();

    const resourceId = v7();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setEmailDocument(resourceId, emailKind, createEmailButtonDocument("a"));
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ID);
    const component = await mountSuspended(PageBuilderContentPanel, { props: { kind: emailKind, resourceId } });

    expect(component.getComponent(UiSchemaForm).props()).toHaveProperty("modelValue", { content: "a" });

    component.getComponent(UiSchemaForm).vm.$emit("update:modelValue", { content: "b" });

    expect(pageBuilderDocumentStore.getHeldDocument(resourceId)?.document).toStrictEqual(
      createEmailButtonDocument("b"),
    );

    component.unmount();
  });

  test("a block with no content fields says where to edit it", async () => {
    expect.hasAssertions();

    const resourceId = v7();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setEmailDocument(resourceId, emailKind, TEST_EMAIL);
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_NESTED_TEXT_ID);
    const component = await mountSuspended(PageBuilderContentPanel, { props: { kind: emailKind, resourceId } });

    expect(component.findComponent(UiSchemaForm).exists()).toBe(false);
    expect(component.text()).toContain("No content settings");
    expect(component.text()).toContain("Style tab");

    component.unmount();
  });

  test("with nothing selected the panel edits the root language", async () => {
    expect.hasAssertions();

    const resourceId = v7();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, createButtonDocument());
    const component = await mountSuspended(PageBuilderContentPanel, { props: { kind: webpageKind, resourceId } });

    component.getComponent(UiSchemaForm).vm.$emit("update:modelValue", { lang: "a" });

    expect(pageBuilderDocumentStore.getDocument(resourceId)?.root).toStrictEqual({ props: { lang: "a", tokens: {} } });

    component.unmount();
  });

  // A survey invite's picker over one published survey and one that is not, as the survey list answers its query
  const mountInvitePicker = async (kind: typeof emailKind | typeof webpageKind) => {
    const resourceId = v7();
    const published = createResourceListItem({ type: ResourceType.Survey });
    const unpublished = createResourceListItem({ type: ResourceType.Survey });
    const publishedInList = { ...published, publication: createPublication(published.id) };
    const unpublishedInList = { ...unpublished, publication: null };
    trpcMsw.survey.readResources.query(({ input }) => ({
      items: input?.isPublished ? [publishedInList] : [publishedInList, unpublishedInList],
      nextCursor: "",
    }));
    trpcMsw.resource.readResource.query(() => publishedInList);
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    if (kind === emailKind)
      pageBuilderDocumentStore.setEmailDocument(resourceId, emailKind, createEmailSurveyInviteDocument(NO_SURVEY_ID));
    else pageBuilderDocumentStore.setDocument(resourceId, webpageKind, createSurveyInviteDocument(NO_SURVEY_ID));
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ID);
    const component = await mountSuspended(PageBuilderContentPanel, { props: { kind, resourceId } });
    await flushPromises();

    return { component, pageBuilderDocumentStore, published, resourceId };
  };

  test("owner binds a published survey", async () => {
    expect.hasAssertions();

    const { component, pageBuilderDocumentStore, published, resourceId } = await mountInvitePicker(webpageKind);

    expect(component.getComponent(ResourceLinkSelect).props("resources")).toStrictEqual({
      items: [{ meaning: UiIconMeaning.Survey, title: published.name, value: published.id }],
      nextCursor: "",
    });
    component.getComponent(ResourceLinkSelect).vm.$emit("update:modelValue", published.id);

    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content).toStrictEqual(
      createSurveyInviteDocument(published.id).content,
    );

    component.unmount();
  });

  test("an unpublished survey is not offered", async () => {
    expect.hasAssertions();

    const { component, published } = await mountInvitePicker(webpageKind);

    expect(component.getComponent(ResourceLinkSelect).props("resources")).toStrictEqual({
      items: [{ meaning: UiIconMeaning.Survey, title: published.name, value: published.id }],
      nextCursor: "",
    });

    component.unmount();
  });

  test("an email's invite offers only the published surveys, and binds the one chosen", async () => {
    expect.hasAssertions();

    const { component, pageBuilderDocumentStore, published, resourceId } = await mountInvitePicker(emailKind);

    expect(component.getComponent(ResourceLinkSelect).props("resources")).toStrictEqual({
      items: [{ meaning: UiIconMeaning.Survey, title: published.name, value: published.id }],
      nextCursor: "",
    });
    component.getComponent(ResourceLinkSelect).vm.$emit("update:modelValue", published.id);

    expect(pageBuilderDocumentStore.getEmailDocument(resourceId)?.content).toStrictEqual(
      createEmailSurveyInviteDocument(published.id).content,
    );

    component.unmount();
  });

  test("a bound survey is unpublished later", async () => {
    expect.hasAssertions();

    const resourceId = v7();
    const survey = createResourceListItem({ type: ResourceType.Survey });
    trpcMsw.survey.readResources.query(() => createEmptyPage());
    trpcMsw.resource.readResource.query(() => ({ ...survey, publication: null }));
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const document = createSurveyInviteDocument(survey.id);
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, document);
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ID);
    const component = await mountSuspended(PageBuilderContentPanel, { props: { kind: webpageKind, resourceId } });
    await flushPromises();

    expect(component.findAll('[role="alert"]').map((alert) => alert.text())).toStrictEqual([
      getUnpublishedResourceMessage(survey.name),
    ]);
    expect(component.getComponent(ResourceLinkSelect).props("resources")).toStrictEqual(createEmptyPage());
    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content).toStrictEqual(document.content);

    component.unmount();
  });

  test("no published survey to offer", async () => {
    expect.hasAssertions();

    const resourceId = v7();
    trpcMsw.survey.readResources.query(() => createEmptyPage());
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const document = createSurveyInviteDocument(NO_SURVEY_ID);
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, document);
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ID);
    const component = await mountSuspended(PageBuilderContentPanel, { props: { kind: webpageKind, resourceId } });
    await flushPromises();

    expect(component.get('[role="status"]').text()).toBe("A survey must be published before it can be chosen");
    expect(component.findComponent({ name: "UiSelect" }).props("items")).toStrictEqual([]);
    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content).toStrictEqual(document.content);

    component.unmount();
  });

  test("the Content panel sets a button to open in a new tab", async () => {
    expect.hasAssertions();

    const resourceId = v7();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, createButtonDocument());
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ID);
    const component = await mountSuspended(PageBuilderContentPanel, { props: { kind: webpageKind, resourceId } });

    component
      .getComponent(UiSchemaForm)
      .vm.$emit("update:modelValue", { elementId: "", href: TEST_URL, label: TEST_LABEL, target: ButtonTarget.NewTab });

    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content).toStrictEqual([
      {
        props: { elementId: "", href: TEST_URL, id: TEST_ID, label: TEST_LABEL, target: ButtonTarget.NewTab },
        type: WebpageNodeType.Button,
      },
    ]);

    component.unmount();
  });

  test("the Content panel sets an element id", async () => {
    expect.hasAssertions();

    const resourceId = v7();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, createButtonDocument());
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ID);
    const component = await mountSuspended(PageBuilderContentPanel, { props: { kind: webpageKind, resourceId } });

    component
      .getComponent(UiSchemaForm)
      .vm.$emit("update:modelValue", {
        elementId: "a",
        href: TEST_URL,
        label: TEST_LABEL,
        target: ButtonTarget.SameTab,
      });

    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content).toStrictEqual([
      {
        props: { elementId: "a", href: TEST_URL, id: TEST_ID, label: TEST_LABEL, target: ButtonTarget.SameTab },
        type: WebpageNodeType.Button,
      },
    ]);

    component.unmount();
  });

  const TEST_UPLOADED_URL = "/api/resource-assets/a/files/b";
  const IMAGE_FILE: ResourceFile = { mimetype: "image/png", size: 2048, url: "/api/resource-assets/c" };
  const VIDEO_FILE: ResourceFile = { mimetype: "video/mp4", size: 4096, url: "/api/resource-assets/d" };

  test("uploading an image sets the image source", async () => {
    expect.hasAssertions();

    const resourceId = v7();
    uploadFileMock.mockResolvedValueOnce(TEST_UPLOADED_URL);
    const component = await mountMediaPanel(resourceId, createTestImageNode(PLACEHOLDER_MEDIA_URL, TEST_OTHER_ID));
    const file = createFile("image/png");
    component.findComponent(UiFileField).vm.$emit("update:modelValue", [file]);
    await flushPromises();

    expect(uploadFileMock).toHaveBeenCalledExactlyOnceWith(file);
    expect(getMediaSource(resourceId)).toBe(TEST_UPLOADED_URL);
  });

  test("a failed upload leaves the image unchanged", async () => {
    expect.hasAssertions();

    const resourceId = v7();
    uploadFileMock.mockRejectedValueOnce(new Error(" "));
    const component = await mountMediaPanel(resourceId, createTestImageNode(TEST_URL, TEST_OTHER_ID));
    component.findComponent(UiFileField).vm.$emit("update:modelValue", [createFile("image/png")]);
    await flushPromises();

    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    expect(getMediaSource(resourceId)).toBe(TEST_URL);
    expect(alerts.value).toHaveLength(1);
  });

  test("a file that is not an image is refused before upload", async () => {
    expect.hasAssertions();

    const resourceId = v7();
    const component = await mountMediaPanel(resourceId, createTestImageNode(TEST_URL, TEST_OTHER_ID));
    component.findComponent(UiFileField).vm.$emit("update:modelValue", [createFile("text/plain")]);
    await flushPromises();

    expect(uploadFileMock).not.toHaveBeenCalled();
    expect(getMediaSource(resourceId)).toBe(TEST_URL);
  });

  test("uploading a video sets the video source", async () => {
    expect.hasAssertions();

    const resourceId = v7();
    uploadFileMock.mockResolvedValueOnce(TEST_UPLOADED_URL);
    const component = await mountMediaPanel(resourceId, createVideoNode(PLACEHOLDER_MEDIA_URL));
    component.findComponent(UiFileField).vm.$emit("update:modelValue", [createFile("video/mp4")]);
    await flushPromises();

    expect(getMediaSource(resourceId)).toBe(TEST_UPLOADED_URL);
  });

  test("a video over the upload size limit is refused", async () => {
    expect.hasAssertions();

    const resourceId = v7();
    const component = await mountMediaPanel(resourceId, createVideoNode(TEST_URL));
    component
      .findComponent(UiFileField)
      .vm.$emit("update:modelValue", [createFile("video/mp4", MAX_FILE_REQUEST_SIZE + 1)]);
    await flushPromises();

    expect(uploadFileMock).not.toHaveBeenCalled();
    expect(getMediaSource(resourceId)).toBe(TEST_URL);
  });

  test("choosing a listed image sets the image source", async () => {
    expect.hasAssertions();

    const resourceId = v7();
    trpcMsw.webpage.readResourceFiles.query(() => [IMAGE_FILE, VIDEO_FILE]);
    const component = await mountMediaPanel(resourceId, createTestImageNode(PLACEHOLDER_MEDIA_URL, TEST_OTHER_ID));
    component
      .findComponent(PageBuilderFilePicker)
      .findComponent(UiSelect)
      .vm.$emit("update:modelValue", IMAGE_FILE.url);
    await flushPromises();

    expect(component.findComponent(PageBuilderMediaField).exists()).toBe(true);
    expect(getMediaSource(resourceId)).toBe(IMAGE_FILE.url);
  });

  test("choosing a listed video sets the video source", async () => {
    expect.hasAssertions();

    const resourceId = v7();
    trpcMsw.webpage.readResourceFiles.query(() => [IMAGE_FILE, VIDEO_FILE]);
    const component = await mountMediaPanel(resourceId, createVideoNode(PLACEHOLDER_MEDIA_URL));
    component
      .findComponent(PageBuilderFilePicker)
      .findComponent(UiSelect)
      .vm.$emit("update:modelValue", VIDEO_FILE.url);
    await flushPromises();

    expect(getMediaSource(resourceId)).toBe(VIDEO_FILE.url);
  });
});
