// @vitest-environment nuxt
import type { ProgramStatusRow } from "#shared/models/resource/program/ProgramStatusRow";

import { MimeType } from "#shared/models/file/MimeType";
import ResourceProgramStatus from "@/components/Resource/Program/Status.vue";
import { downloadFile } from "@/services/app/downloadFile";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { createParticipantLinksCsv } from "@/services/resource/program/createParticipantLinksCsv";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useResourceStore } from "@/store/resource";
import { ResourceType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { assert, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/app/downloadFile"), () => ({ downloadFile: vi.fn<typeof downloadFile>() }));

// The blade renders inside the shell's Suspense boundary, which is what shows a skeleton while it resolves —
// So the blade awaits everything it renders from in setup rather than mounting empty behind its own flag
describe("resourceProgramStatus", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const resource = createResourceListItem({ id: resourceId, type: ResourceType.Program });
  const keyValue = "keyValue";
  const statusRow: ProgramStatusRow = { addedAt: new Date(0), isResponded: true, keyValue };
  const keyColumn = "keyColumn";
  const surveyId = crypto.randomUUID();

  beforeEach(async () => {
    useRouter().currentRoute.value.params.id = resourceId;
    trpcMsw.resource.readResource.query(() => ({ ...resource, publication: null }));
    trpcMsw.program.readResourceContent.query(() => ({ emailId: "", keyColumn, surveyId }));
    // The page reads the row before any blade mounts, and a content load reads only the blob
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
  });

  const setStatus = (isRespondedPartial: boolean) => {
    trpcMsw.program.readProgramStatus.query(() => ({ isRespondedPartial, rows: [statusRow] }));
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
    expect(component.get('[role="meter"]').attributes("aria-valuetext")).toBe("at least 100% responded");
    expect(component.text()).toContain("may have already responded");
  });

  // The mutation's answer is the only place a participant's token reaches the owner, and without the link it makes
  // An Identified survey cannot be answered at all
  test("hands the owner every participant's link when they generate", async () => {
    expect.hasAssertions();

    const participants = [{ keyValue, token: crypto.randomUUID() }];
    setStatus(false);
    trpcMsw.program.generateProgramParticipants.mutation(() => ({ participants }));
    const component = await mountSuspended(ResourceProgramStatus);
    const generateButton = component.findAll("button").find((button) => button.text() === "Generate participants");
    assert.exists(generateButton);
    // The download follows the mutation's batched round trip, so it is awaited itself rather than a flush
    const downloaded = Promise.withResolvers<void>();
    vi.mocked(downloadFile).mockImplementationOnce(() => {
      downloaded.resolve();
    });
    await generateButton.trigger("click");
    await downloaded.promise;

    expect(downloadFile).toHaveBeenCalledExactlyOnceWith(
      `${resource.name}-participants.csv`,
      createParticipantLinksCsv(keyColumn, surveyId, participants, window.location.origin),
      MimeType.Csv,
    );
  });
});
