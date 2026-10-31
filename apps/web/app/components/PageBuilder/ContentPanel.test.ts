// @vitest-environment nuxt
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { EmailDocument } from "@/models/pageBuilder/EmailDocument";
import type { ResourcePublicationInResource } from "@esposter/db-schema";

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
import { MAX_EMAIL_PREVIEW_LENGTH } from "#shared/services/pageBuilder/email/constants";
import { webpageDocumentSchema } from "#shared/services/pageBuilder/webpageDocumentSchema";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import PageBuilderContentPanel from "@/components/PageBuilder/ContentPanel.vue";
import ResourceLinkSelect from "@/components/Resource/Link/Select.vue";
import UiSchemaForm from "@/components/Ui/SchemaForm/Index.vue";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
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
const createEmailSurveyInviteDocument = (surveyId: string): EmailDocument => ({
  content: [
    {
      props: {
        children: [
          {
            props: {
              children: [{ props: { id: TEST_ID, label: TEST_LABEL, surveyId }, type: EmailNodeType.SurveyInvite }],
              id: TEST_OTHER_ID,
            },
            type: MjmlNodeType.Column,
          },
        ],
        id: TEST_THIRD_ID,
      },
      type: MjmlNodeType.Section,
    },
  ],
  root: { props: {} },
});

describe("pageBuilderContentPanel", () => {
  const { trpcMsw } = setupMswTrpc();

  test("editing a button's label in the content panel shows on the canvas", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, createButtonDocument());
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ID);
    const component = await mountSuspended(PageBuilderContentPanel, { props: { kind: webpageKind, resourceId } });

    component.getComponent(UiSchemaForm).vm.$emit("update:modelValue", { href: TEST_URL, label: "Open" });

    const document = webpageDocumentSchema.parse(pageBuilderDocumentStore.getDocument(resourceId));

    expect(document.content).toStrictEqual([
      { props: { href: TEST_URL, id: TEST_ID, label: "Open" }, type: WebpageNodeType.Button },
    ]);
    const canvas = mount(
      defineComponent({ render: () => h("div", renderCanvasVNodes(webpageKind, document, TEST_CONTEXT)) }),
    );

    expect(canvas.text()).toBe("Open");

    canvas.unmount();
    component.unmount();
  });

  test("an invalid label is not applied", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, createButtonDocument());
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ID);
    const component = await mountSuspended(PageBuilderContentPanel, { props: { kind: webpageKind, resourceId } });

    component.getComponent(UiSchemaForm).vm.$emit("update:modelValue", { href: TEST_URL, label: "" });

    expect(pageBuilderDocumentStore.getDocument(resourceId)?.content).toStrictEqual(createButtonDocument().content);

    component.unmount();
  });

  test("with nothing selected the panel edits the root language", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, createButtonDocument());
    const component = await mountSuspended(PageBuilderContentPanel, { props: { kind: webpageKind, resourceId } });

    component.getComponent(UiSchemaForm).vm.$emit("update:modelValue", { lang: "fr" });

    expect(pageBuilderDocumentStore.getDocument(resourceId)?.root).toStrictEqual({ props: { lang: "fr", tokens: {} } });

    component.unmount();
  });

  test("editing an email's preview text writes the root's preview", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setEmailDocument(resourceId, emailKind, { content: [], root: { props: {} } });
    const component = await mountSuspended(PageBuilderContentPanel, { props: { kind: emailKind, resourceId } });

    component.getComponent(UiSchemaForm).vm.$emit("update:modelValue", { preview: "a" });

    expect(pageBuilderDocumentStore.getEmailDocument(resourceId)?.root.props.preview).toBe("a");

    component.unmount();
  });

  test("an email's preview text shows the length its schema allows beside the field", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    pageBuilderDocumentStore.setEmailDocument(resourceId, emailKind, { content: [], root: { props: {} } });
    const component = await mountSuspended(PageBuilderContentPanel, { props: { kind: emailKind, resourceId } });

    expect(component.text()).toContain(`0 / ${MAX_EMAIL_PREVIEW_LENGTH}`);

    component.unmount();
  });

  test("an invite offers only the published surveys, and binds the one chosen", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
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
    pageBuilderDocumentStore.setDocument(resourceId, webpageKind, createSurveyInviteDocument(NO_SURVEY_ID));
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ID);
    const component = await mountSuspended(PageBuilderContentPanel, { props: { kind: webpageKind, resourceId } });
    await flushPromises();

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

  test("an email's invite offers only the published surveys, and binds the one chosen", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
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
    pageBuilderDocumentStore.setEmailDocument(resourceId, emailKind, createEmailSurveyInviteDocument(NO_SURVEY_ID));
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    pageBuilderCanvasStore.setSelectedNodeId(resourceId, TEST_ID);
    const component = await mountSuspended(PageBuilderContentPanel, { props: { kind: emailKind, resourceId } });
    await flushPromises();

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

  test("a bound survey that is no longer published is flagged, not offered, and keeps its id", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
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

  test("with no published survey the picker says so, offers no blank choice, and writes no id", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
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
