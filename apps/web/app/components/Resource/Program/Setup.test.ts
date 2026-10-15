// @vitest-environment nuxt
import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import ResourceProgramSetup from "@/components/Resource/Program/Setup.vue";
import { useSession } from "@/services/auth/authClient.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useResourceStore } from "@/store/resource";
import { ResourceType, SurveyResponseMode } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, test } from "vitest";

describe("resourceProgramSetup", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const surveyId = crypto.randomUUID();
  const resource = createResourceListItem({ id: resourceId, type: ResourceType.Program });

  beforeEach(async () => {
    useSession.mockReturnValue({ data: ref({ user: { id: resource.userId } }) });
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    trpcMsw.resource.readResource.query(() => ({ ...resource, publication: null }));
    trpcMsw.program.readResourceContent.query(() => ({ emailId: "", keyColumn: "", surveyId }));
    trpcMsw.email.readResources.query(() => ({ hasMore: false, items: [] }));
    trpcMsw.survey.readResources.query(() => ({ hasMore: false, items: [] }));
    trpcMsw.survey.readResourceContent.query(() => ({
      model: "",
      settings: surveySettingsSchema.parse({ responseMode: SurveyResponseMode.Anonymous }),
    }));
    await useResourceStore().readResource();
  });

  test("warns under the survey selector when its responses cannot be matched to participants", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceProgramSetup, { route: RoutePath.Resource(resourceId) });
    await flushPromises();

    expect(component.text()).toContain("Anonymous mode drops participant tokens");
  });
});
