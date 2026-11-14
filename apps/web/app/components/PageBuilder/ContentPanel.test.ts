// @vitest-environment nuxt
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { EmailDocument } from "@/models/pageBuilder/EmailDocument";
import type { ResourcePublicationInResource } from "@esposter/db-schema";
import type { MjmlColumnNode } from "mjml-blocks";

import { EmailNodeType } from "#shared/models/pageBuilder/EmailNodeType";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { NO_SURVEY_ID } from "#shared/services/pageBuilder/constants";
import {
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
import PageBuilderContentPanel from "@/components/PageBuilder/ContentPanel.vue";
import ResourceLinkSelect from "@/components/Resource/Link/Select.vue";
import UiSchemaForm from "@/components/Ui/SchemaForm/Index.vue";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { TEST_EMAIL, TEST_NESTED_TEXT_ID } from "@/services/pageBuilder/constants.test";
import { emailKind } from "@/services/pageBuilder/emailKind";
import { renderCanvasVNodes } from "@/services/pageBuilder/renderCanvasVNodes";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { getUnpublishedResourceMessage } from "@/services/resource/getUnpublishedResourceMessage";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { ResourceType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises, mount } from "@vue/test-utils";
import { MjmlNodeType } from "mjml-blocks";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

const createButtonDocument = (): WebpageDocument => ({
  content: [{ props: { href: TEST_URL, id: TEST_ID, label: TEST_LABEL }, type: WebpageNodeType.Button }],
  root: TEST_ROOT,
});
const createSurveyInviteDocument = (surveyId: string): WebpageDocument => ({
  content: [{ props: { id: TEST_ID, label: TEST_LABEL, surveyId }, type: WebpageNodeType.SurveyInvite }],
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
  root: { props: {} },
});
const createEmailSurveyInviteDocument = (surveyId: string): EmailDocument =>
  createEmailLeafDocument({ props: { id: TEST_ID, label: TEST_LABEL, surveyId }, type: EmailNodeType.SurveyInvite });

// An email's button, whose form edits its label
const createEmailButtonDocument = (content: string): EmailDocument =>
  createEmailLeafDocument({ props: { content, id: TEST_ID }, type: MjmlNodeType.Button });

describe("pageBuilderContentPanel", () => {
  const { trpcMsw } = setupMswTrpc();

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
      { props: { href: TEST_URL, id: TEST_ID, label: "a" }, type: WebpageNodeType.Button },
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
      hasMore: false,
      items: input?.isPublished ? [publishedInList] : [publishedInList, unpublishedInList],
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
      hasMore: false,
      items: [{ meaning: UiIconMeaning.Survey, title: published.name, value: published.id }],
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
      hasMore: false,
      items: [{ meaning: UiIconMeaning.Survey, title: published.name, value: published.id }],
    });

    component.unmount();
  });

  test("an email's invite offers only the published surveys, and binds the one chosen", async () => {
    expect.hasAssertions();

    const { component, pageBuilderDocumentStore, published, resourceId } = await mountInvitePicker(emailKind);

    expect(component.getComponent(ResourceLinkSelect).props("resources")).toStrictEqual({
      hasMore: false,
      items: [{ meaning: UiIconMeaning.Survey, title: published.name, value: published.id }],
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
    trpcMsw.survey.readResources.query(() => ({ hasMore: false, items: [] }));
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
    expect(component.getComponent(ResourceLinkSelect).props("resources")).toStrictEqual({ hasMore: false, items: [] });
    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content).toStrictEqual(document.content);

    component.unmount();
  });

  test("no published survey to offer", async () => {
    expect.hasAssertions();

    const resourceId = v7();
    trpcMsw.survey.readResources.query(() => ({ hasMore: false, items: [] }));
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
});
