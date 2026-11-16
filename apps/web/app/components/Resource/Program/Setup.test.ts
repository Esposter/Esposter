// @vitest-environment nuxt
import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import ResourceProgramSetup from "#src/components/Resource/Program/Setup.vue";
import { useSession } from "#src/services/auth/authClient.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useResourceStore } from "#src/store/resource/index";
import { createEmptyPage, ResourceType, SurveyResponseMode } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test } from "vitest";
import { createSurveyDocument } from "vue-survey-engine-headless";

describe("resourceProgramSetup", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = v7();
  const surveyId = v7();
  const resource = createResourceListItem({ id: resourceId, type: ResourceType.Program });

  beforeEach(async () => {
    // The route's auth middleware reads the session as the nuxt pair (`useAuthSession` hands `useSession` a fetcher),
    // And the audience picker reads it as the ref, so the one session is answered in both shapes
    const session = { user: { id: resource.userId } };
    useSession.mockImplementation((fetcher) => (fetcher ? { data: ref(session) } : ref({ data: session })));
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    trpcMsw.resource.readResource.query(() => ({ ...resource, publication: null }));
    trpcMsw.program.readResourceContent.query(() => ({ emailId: "", keyColumn: "", surveyId }));
    trpcMsw.email.readResources.query(() => createEmptyPage());
    trpcMsw.survey.readResources.query(() => createEmptyPage());
    trpcMsw.survey.readResourceContent.query(() => ({
      document: createSurveyDocument(),
      settings: surveySettingsSchema.parse({ responseMode: SurveyResponseMode.Anonymous }),
    }));
    const resourceStore = useResourceStore();
    await resourceStore.readResource();
  });

  test("warns under the survey selector when its responses cannot be matched to participants", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceProgramSetup, { route: RoutePath.Resource(resourceId) });
    await flushPromises();

    expect(component.text()).toContain("Anonymous mode drops participant tokens");
  });
});
