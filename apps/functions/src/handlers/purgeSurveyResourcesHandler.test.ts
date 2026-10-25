import { purgeSurveyResourcesHandler } from "#src/handlers/purgeSurveyResourcesHandler";
import { createEventGridEvent } from "#src/services/azure/createEventGridEvent.test";
import { purgeSurveyResources } from "#src/services/resource/purgeSurveyResources";
import { InvocationContext } from "@azure/functions";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/resource/purgeSurveyResources"), () => ({
  purgeSurveyResources: vi.fn<typeof purgeSurveyResources>(),
}));

describe(purgeSurveyResourcesHandler, () => {
  const context = new InvocationContext({ logHandler: () => {} });

  test("runs the purge once and rethrows nothing on a clean run", async () => {
    expect.hasAssertions();

    await purgeSurveyResourcesHandler(createEventGridEvent(), context);

    expect(purgeSurveyResources).toHaveBeenCalledExactlyOnceWith(context);
  });
});
