// @vitest-environment nuxt
import type { ProgramStatusRow } from "#shared/models/resource/program/ProgramStatusRow";
import type { Resource } from "@esposter/db-schema";

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
  const statusRow: ProgramStatusRow = {
    addedAt: new Date(0),
    isResponded: true,
    keyValue,
    publicId: crypto.randomUUID(),
    token: "token",
  };

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
            type: ResourceType.Program,
            updatedAt: new Date(0),
          }) as Resource,
      ),
      trpcMsw.program.readResourceContent.query(() => undefined),
      trpcMsw.program.readProgramStatus.query(() => [statusRow]),
    );
  });

  test("opens on the loaded status rows", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceProgramStatus);

    expect(component.text()).toContain(keyValue);
    expect(component.text()).toContain("1 of 1 responded");
  });
});
