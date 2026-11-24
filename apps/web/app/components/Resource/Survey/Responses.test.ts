// @vitest-environment nuxt
import type { SurveyResponseRecords } from "#shared/models/resource/survey/SurveyResponseRecords";
import type { VueWrapper } from "@vue/test-utils";
import type { SurveyDocument } from "vue-survey-engine-headless";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import ResourceSurveyResponseSummaryCard from "#src/components/Resource/Survey/Response/SummaryCard.vue";
import ResourceSurveyResponses from "#src/components/Resource/Survey/Responses.vue";
import UiConfirmDialog from "#src/components/Ui/ConfirmDialog.vue";
import UiEmptyState from "#src/components/Ui/EmptyState.vue";
import UiErrorState from "#src/components/Ui/ErrorState.vue";
import UiOverflowMenu from "#src/components/Ui/OverflowMenu.vue";
import { useSession } from "#src/services/auth/authClient.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useResourceStore } from "#src/store/resource/index";
import { ResourceType, SurveyResponseMode } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { assert, beforeEach, describe, expect, test } from "vitest";
import { createSurveyDocument, SurveyNodeType, surveyNodeTypeDefinitionMap } from "vue-survey-engine-headless";

// The row's own menu chooses the delete and the confirm answers it, as the owner does it on screen
const chooseDelete = (component: VueWrapper) => {
  const deleteItem = component
    .findComponent(UiOverflowMenu)
    .props("items")
    .find((item) => "title" in item && item.title === "Delete response");
  assert.exists(deleteItem);
  deleteItem.onClick?.();
  component.findComponent(UiConfirmDialog).props("confirm")();
};

describe("resourceSurveyResponses", () => {
  const { trpcMsw } = setupMswTrpc();
  const surveyId = v7();
  const responseId = v7();
  const question = "Favourite colour";
  const surveyDocument = createSurveyDocument();
  const [page] = surveyDocument.content;
  assert(page);
  const document: SurveyDocument = {
    ...surveyDocument,
    content: [
      {
        ...page,
        props: {
          ...page.props,
          children: [
            {
              props: {
                ...surveyNodeTypeDefinitionMap[SurveyNodeType.Text].createDefaultProps(),
                id: v7(),
                name: "colour",
                title: question,
              },
              type: SurveyNodeType.Text,
            },
          ],
        },
      },
    ],
  };
  const records: SurveyResponseRecords = {
    columns: [{ name: "colour", type: ColumnType.String }],
    isCountCapped: false,
    rows: [{ colour: "Teal", responseId }],
    totalRows: 1,
  };

  beforeEach(() => {
    // The blade reads its id off the resource page's route, which the auth middleware guards
    useSession.mockReturnValue({ data: ref({ user: { id: v7() } }) });
    Object.assign(useRouter().currentRoute.value.params, { id: surveyId });
    // The dialogs' targets are keyed by the open resource.
    // So the blade is opened on its survey, as the resource page does.
    const resourceStore = useResourceStore();
    const { applyResource } = resourceStore;
    applyResource(createResourceListItem({ id: surveyId, type: ResourceType.Survey }), null, null);
    trpcMsw.survey.readSurveyResponseRecords.query(() => records);
    trpcMsw.survey.readResourceContent.query(() => ({
      document,
      settings: surveySettingsSchema.parse({ responseMode: SurveyResponseMode.Identified }),
    }));
  });

  test("says there are no responses yet when the survey has none", async () => {
    expect.hasAssertions();

    trpcMsw.survey.readSurveyResponseRecords.query(() => ({
      columns: records.columns,
      isCountCapped: false,
      rows: [],
      totalRows: 0,
    }));
    const component = await mountSuspended(ResourceSurveyResponses, { route: RoutePath.Resource(surveyId) });

    expect(component.findComponent(UiEmptyState).props("title")).toBe("No responses yet");
  });

  test("summarises each question the responses answer", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceSurveyResponses, { route: RoutePath.Resource(surveyId) });

    const cards = component.findAllComponents(ResourceSurveyResponseSummaryCard);

    expect(cards.map((card) => card.props("card").title)).toStrictEqual([question]);
    expect(component.findComponent(UiEmptyState).exists()).toBe(false);
  });

  // The survey is read only for the summary.
  // So a survey that cannot be read leaves the responses to the individual view.
  test("keeps the individual responses when the survey itself cannot be read", async () => {
    expect.hasAssertions();

    trpcMsw.survey.readResourceContent.query(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Survey unavailable" });
    });
    const component = await mountSuspended(ResourceSurveyResponses, { route: RoutePath.Resource(surveyId) });
    const individualTab = component.findAll('[role="tab"]').find((tab) => tab.text() === "Individual");
    assert.exists(individualTab);
    expect(component.findComponent(UiErrorState).props("error")).toBe("Survey unavailable");
    await individualTab.trigger("click");
    await flushPromises();

    const cellTexts = component.findAll("td").map((cell) => cell.text());

    expect(cellTexts).toStrictEqual(["Teal", "Response actionsView response Delete response"]);
  });

  // A question named like the actions column is a column of answers.
  // So it keeps its own cells and gets no menu of its own.
  test("a question named actions shows its answers, not the response menu", async () => {
    expect.hasAssertions();

    trpcMsw.survey.readSurveyResponseRecords.query(() => ({
      columns: [{ name: "actions", type: ColumnType.String }],
      isCountCapped: false,
      rows: [{ actions: "Teal", responseId }],
      totalRows: 1,
    }));
    const component = await mountSuspended(ResourceSurveyResponses, { route: RoutePath.Resource(surveyId) });
    const individualTab = component.findAll('[role="tab"]').find((tab) => tab.text() === "Individual");
    assert.exists(individualTab);
    await individualTab.trigger("click");
    await flushPromises();

    const cellTexts = component.findAll("td").map((cell) => cell.text());

    expect(cellTexts).toStrictEqual(["Teal", "Response actionsView response Delete response"]);
  });

  // The table drops a deleted response once the server has deleted it, so a delete still in flight keeps it listed
  test("keeps a response listed while its delete is in flight", async () => {
    expect.hasAssertions();

    const isDeleted = Promise.withResolvers<void>();
    trpcMsw.survey.deleteSurveyResponse.mutation(async () => {
      await isDeleted.promise;
    });
    const component = await mountSuspended(ResourceSurveyResponses, { route: RoutePath.Resource(surveyId) });
    const individualTab = component.findAll('[role="tab"]').find((tab) => tab.text() === "Individual");
    assert.exists(individualTab);
    await individualTab.trigger("click");
    await flushPromises();
    chooseDelete(component);
    await flushPromises();
    const listedWhileDeleting = component.findAll("td").map((cell) => cell.text());
    isDeleted.resolve();
    await flushPromises();

    expect(listedWhileDeleting).toContain("Teal");
  });

  // The delete refreshes the table once it lands.
  // So a read that was in flight before the delete cannot put the response back.
  test("a read in flight when the delete lands does not bring the deleted response back", async () => {
    expect.hasAssertions();

    const lateRead = Promise.withResolvers<void>();
    let readCount = 0;
    const isRefreshing = Promise.withResolvers<void>();
    trpcMsw.survey.deleteSurveyResponse.mutation(() => undefined);
    trpcMsw.survey.readSurveyResponseRecords.query(async () => {
      readCount += 1;
      if (readCount === 1) return records;
      if (readCount === 2) {
        await lateRead.promise;
        return records;
      }
      isRefreshing.resolve();
      return { columns: records.columns, isCountCapped: false, rows: [], totalRows: 0 };
    });
    const component = await mountSuspended(ResourceSurveyResponses, { route: RoutePath.Resource(surveyId) });
    const individualTab = component.findAll('[role="tab"]').find((tab) => tab.text() === "Individual");
    assert.exists(individualTab);
    await individualTab.trigger("click");
    await flushPromises();
    // The table's own read, the one a delete's refresh supersedes, is started as the owner's screen would start it
    const { refreshResponses } = component.vm as unknown as { refreshResponses: () => Promise<void> };
    const lateRefresh = refreshResponses();
    chooseDelete(component);
    // The delete's answer refreshes the table, so the refresh is in flight before the late read is released
    await isRefreshing.promise;
    lateRead.resolve();
    await lateRefresh;
    await flushPromises();

    expect(component.findAll("td").map((cell) => cell.text())).not.toContain("Teal");
  });
});
