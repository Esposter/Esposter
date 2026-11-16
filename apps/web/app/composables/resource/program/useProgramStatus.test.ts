// @vitest-environment nuxt
import type { ProgramStatusRow } from "#shared/models/resource/program/ProgramStatusRow";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { ProgramInviteScope } from "#shared/models/resource/program/ProgramInviteScope";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { useProgramStatus } from "#src/composables/resource/program/useProgramStatus";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useResourceStore } from "#src/store/resource/index";
import { useProgramStore } from "#src/store/resource/program/index";
import { ResourceType } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useProgramStatus, () => {
  const { trpcMsw } = setupMswTrpc();
  const resource = createResourceListItem({ type: ResourceType.Program });
  const keyColumn = "keyColumn";
  const keyValue = "keyValue";
  const surveyId = v7();
  const statusRow: ProgramStatusRow = { addedAt: new Date(0), isResponded: false, keyValue };

  // Both writes issue links the server refuses, and each answers false so the dialog that asked stays open to be tried
  // Again rather than closing over a refusal
  test("a refused export or regeneration resolves false, so its dialog stays open", async () => {
    expect.hasAssertions();

    trpcMsw.resource.readResource.query(() => ({ ...resource, publication: null }));
    trpcMsw.program.readResourceContent.query(() => ({
      audience: { id: v7(), type: DatasetProviderType.Sheet },
      emailId: v7(),
      keyColumn,
      surveyId,
    }));
    trpcMsw.program.readProgramStatus.query(() => ({ isRespondedPartial: false, rows: [statusRow] }));
    trpcMsw.program.issueProgramInvites.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    trpcMsw.program.regenerateProgramParticipantToken.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    Object.assign(useRouter().currentRoute.value.params, { id: resource.id });
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
    const programStore = useProgramStore();
    const { loadContent } = programStore;
    await loadContent();
    const { exportInvites, readStatus, regenerateParticipantLink } = useProgramStatus();
    await readStatus();

    const isExported = await exportInvites(ProgramInviteScope.All);
    const isRegenerated = await regenerateParticipantLink(keyValue);

    expect(isExported).toBe(false);
    expect(isRegenerated).toBe(false);
  });
});
