// @vitest-environment nuxt
import type { ProgramStatusRow } from "#shared/models/resource/program/ProgramStatusRow";
import type { ResourceWithPublication } from "#shared/models/resource/ResourceWithPublication";

import ResourceProgramStatus from "@/components/Resource/Program/Status.vue";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { ResourceType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

// The blade renders inside the shell's Suspense boundary, which is what shows a skeleton while it resolves —
// So the blade awaits everything it renders from in setup rather than mounting empty behind its own flag
describe("resourceProgramStatus", () => {
  const server = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const keyValue = "participant";
  const statusRow: ProgramStatusRow = { addedAt: new Date(0), isResponded: true, keyValue };

  beforeEach(() => {
    setActivePinia(createPinia());
    useRouter().currentRoute.value.params.id = resourceId;
    server.use(
      trpcMsw.resource.readResource.query(
        () =>
          ({
            contentVersion: 0,
            id: resourceId,
            name: "name",
            publication: null,
            type: ResourceType.Program,
            updatedAt: new Date(0),
          }) as ResourceWithPublication,
      ),
      trpcMsw.program.readResourceContent.query(() => undefined),
    );
  });

  const setStatus = (isRespondedPartial: boolean) => {
    server.use(trpcMsw.program.readProgramStatus.query(() => ({ isRespondedPartial, rows: [statusRow] })));
  };

  test("opens on the loaded status rows", async () => {
    expect.hasAssertions();

    setStatus(false);
    const component = await mountSuspended(ResourceProgramStatus);

    expect(component.text()).toContain(keyValue);
    expect(component.text()).toContain("1 of 1 responded");
  });

  // `isResponded` comes from a capped response scan, so past that cap a responder reads as awaiting. The count
  // Is the claim that breaks first — stated flat it is simply wrong, and the table beside it agrees with it
  test("says the responded count is a floor when the response read was capped", async () => {
    expect.hasAssertions();

    setStatus(true);
    const component = await mountSuspended(ResourceProgramStatus);

    expect(component.text()).toContain("at least 1 of 1 responded");
    expect(component.text()).toContain("may have already responded");
  });
});
