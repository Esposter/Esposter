// @vitest-environment nuxt
import type { ProgramStatusRow } from "#shared/models/resource/program/ProgramStatusRow";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { MimeType } from "#shared/models/file/MimeType";
import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import ResourceProgramStatus from "@/components/Resource/Program/Status.vue";
import { downloadFile } from "@/services/app/downloadFile";
import { useSession } from "@/services/auth/authClient.test";
import { createParticipantLinksCsv } from "@/services/resource/program/createParticipantLinksCsv";
import { createProgramInviteHtml } from "@/services/resource/program/createProgramInviteHtml";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useResourceStore } from "@/store/resource";
import { ResourceType, SurveyResponseMode } from "@esposter/db-schema";
import { RoutePath, takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { strToU8, unzipSync } from "fflate";
import { assert, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/app/downloadFile"), () => ({ downloadFile: vi.fn<typeof downloadFile>() }));
vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

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
  const setSurveyMode = (responseMode: SurveyResponseMode) =>
    trpcMsw.survey.readResourceContent.query(() => ({
      model: "",
      settings: surveySettingsSchema.parse({ responseMode }),
    }));

  beforeEach(async () => {
    // The blade reads its id off the resource page's route, which the auth middleware guards
    useSession.mockReturnValue({ data: ref({ user: { id: resource.userId } }) });
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    trpcMsw.resource.readResource.query(() => ({ ...resource, publication: null }));
    trpcMsw.program.readResourceContent.query(() => ({ emailId: "", keyColumn, surveyId }));
    setSurveyMode(SurveyResponseMode.Identified);
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
    const component = await mountSuspended(ResourceProgramStatus, { route: RoutePath.Resource(resourceId) });

    expect(component.text()).toContain(keyValue);
    expect(component.text()).toContain("1 of 1 responded");
  });

  test("warns when an anonymous survey has no participant responses to match", async () => {
    expect.hasAssertions();

    setSurveyMode(SurveyResponseMode.Anonymous);
    trpcMsw.program.readProgramStatus.query(() => ({ isRespondedPartial: false, rows: [] }));
    const component = await mountSuspended(ResourceProgramStatus, { route: RoutePath.Resource(resourceId) });

    expect(component.text()).toContain("Anonymous mode drops participant tokens");
  });

  test("warns when anonymous survey responses leave every participant awaiting", async () => {
    expect.hasAssertions();

    setSurveyMode(SurveyResponseMode.Anonymous);
    trpcMsw.program.readProgramStatus.query(() => ({
      isRespondedPartial: false,
      rows: [{ ...statusRow, isResponded: false }],
    }));
    const component = await mountSuspended(ResourceProgramStatus, { route: RoutePath.Resource(resourceId) });

    expect(component.text()).toContain("Anonymous mode drops participant tokens");
  });

  test("does not warn for identified surveys", async () => {
    expect.hasAssertions();

    setSurveyMode(SurveyResponseMode.Identified);
    setStatus(false);
    const component = await mountSuspended(ResourceProgramStatus, { route: RoutePath.Resource(resourceId) });

    expect(component.text()).not.toContain("Anonymous mode drops participant tokens");
  });

  // `isResponded` comes from a capped response scan, so past that cap a responder reads as awaiting. The count
  // Is the claim that breaks first — stated flat it is simply wrong, and the table beside it agrees with it
  test("says the responded count is a floor when the response read was capped", async () => {
    expect.hasAssertions();

    setStatus(true);
    const component = await mountSuspended(ResourceProgramStatus, { route: RoutePath.Resource(resourceId) });

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
    const component = await mountSuspended(ResourceProgramStatus, { route: RoutePath.Resource(resourceId) });
    const generateButton = component.findAll("button").find((button) => button.text() === "Generate participants");
    assert.exists(generateButton);
    // The click's last call is the status re-read after the download, so the test holds until it lands — a test
    // Ending at the download leaves that read in flight past msw's close, and its log races the worker's teardown
    const { promise: isStatusReread, resolve: onStatusReread } = Promise.withResolvers<void>();
    trpcMsw.program.readProgramStatus.query(() => {
      onStatusReread();
      return { isRespondedPartial: false, rows: [statusRow] };
    });
    await generateButton.trigger("click");
    await isStatusReread;
    await flushPromises();

    expect(downloadFile).toHaveBeenCalledExactlyOnceWith(
      `${resource.name}-participants.csv`,
      createParticipantLinksCsv(keyColumn, surveyId, participants, window.location.origin),
      MimeType.Csv,
    );
  });

  // The invites are read server-side, since only the server holds each participant's token and audience row, and the
  // Zip is the file the owner sends each person, so it names the invites rather than an empty set
  test("exports each invited participant's personalized email as one zip", async () => {
    expect.hasAssertions();

    const token = crypto.randomUUID();
    const surveyPath = RoutePath.View(ResourceType.Survey, surveyId);
    const emailHtml = `<a href="${surveyPath}">Take it</a>`;
    const invite = { keyValue, row: { [keyColumn]: keyValue }, token };
    trpcMsw.program.readResourceContent.query(() => ({
      audience: { id: crypto.randomUUID(), type: DatasetProviderType.Sheet },
      emailId: crypto.randomUUID(),
      keyColumn,
      surveyId,
    }));
    // The click's last call is the invite read, so the test holds until it lands rather than ending with it in flight
    const { promise: isInviteRead, resolve: onInviteRead } = Promise.withResolvers<void>();
    trpcMsw.program.readProgramInvites.query(() => {
      onInviteRead();
      return { emailHtml, invites: [invite], unmatchedCount: 0 };
    });
    setStatus(false);
    const component = await mountSuspended(ResourceProgramStatus, { route: RoutePath.Resource(resourceId) });
    const inviteButton = component.findAll("button").find((button) => button.text() === "Export invites");
    assert.exists(inviteButton);
    await inviteButton.trigger("click");
    await isInviteRead;
    await flushPromises();

    const [fileName, invitesZip, mimeType] = takeOne(vi.mocked(downloadFile).mock.calls);
    assert.instanceOf(invitesZip, Uint8Array);

    expect([fileName, mimeType]).toStrictEqual([`${resource.name}-invites.zip`, "application/zip"]);
    expect(unzipSync(invitesZip)).toStrictEqual({
      [`${keyValue}.html`]: strToU8(createProgramInviteHtml(emailHtml, surveyPath, invite)),
    });
  });
});
