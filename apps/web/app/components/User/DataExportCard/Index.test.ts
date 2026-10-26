// @vitest-environment nuxt
import type { DataExportInUser } from "@esposter/db-schema";
import type { VueWrapper } from "@vue/test-utils";

import UserDataExportCard from "@/components/User/DataExportCard/Index.vue";
import { UserSettingsPageSection } from "@/models/user/UserSettingsPageSection";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { DataExportOmittedItems } from "@/services/user/settings/DataExportOmittedItems";
import { DataExportStatus } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";

const hasButton = (component: VueWrapper, label: string) =>
  component.findAll("button").some((button) => button.text() === label);
const getButton = (component: VueWrapper, label: string) => {
  const button = component.findAll("button").find((element) => element.text() === label);
  assert.exists(button);
  return button;
};

describe("userDataExportCard", () => {
  // Only the date is pinned: the card's expiry check reads the clock, and the flushes between steps still run on real timers
  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  const { trpcMsw } = setupMswTrpc();
  const id = crypto.randomUUID();
  const epoch = new Date(0);
  const nextDay = new Date(Temporal.Duration.from({ days: 1 }).total("milliseconds"));
  const link = "https://example.com";
  const failureReason = "failureReason";
  const baseDataExport: DataExportInUser = {
    blobName: "blobName",
    createdAt: epoch,
    deletedAt: null,
    expiresAt: null,
    failureReason: null,
    id,
    readyAt: null,
    requestedAt: epoch,
    status: DataExportStatus.Queued,
    updatedAt: epoch,
    userId: "userId",
  };
  const mountCard = () =>
    mountSuspended(UserDataExportCard, {
      attachTo: document.body,
      props: { section: UserSettingsPageSection.DataExport },
    });

  test("names what the archive leaves out before any request", async () => {
    expect.hasAssertions();

    const requestDataExport = vi.fn<() => DataExportInUser>(() => baseDataExport);
    trpcMsw.user.readDataExport.query(() => undefined);
    trpcMsw.user.requestDataExport.mutation(requestDataExport);
    const component = await mountCard();
    await flushPromises();

    expect(component.findAll("li").map((item) => item.text())).toStrictEqual(
      DataExportOmittedItems.map(({ title }) => title),
    );
    expect(requestDataExport).not.toHaveBeenCalled();
  });

  test.each([DataExportStatus.Queued, DataExportStatus.Building, DataExportStatus.Failed])(
    "withholds the link while the export is %s",
    async (status) => {
      expect.hasAssertions();

      const generateDataExportLink = vi.fn<(input: string) => string>(() => link);
      trpcMsw.user.readDataExport.query(() => ({ ...baseDataExport, status }));
      trpcMsw.user.generateDataExportLink.mutation(({ input }) => generateDataExportLink(input));
      const component = await mountCard();
      await flushPromises();

      expect(hasButton(component, "Get download link")).toBe(false);
      expect(component.find("a").exists()).toBe(false);
      expect(generateDataExportLink).not.toHaveBeenCalled();
    },
  );

  test("shows a failed export without the reason the build recorded", async () => {
    expect.hasAssertions();

    trpcMsw.user.readDataExport.query(() => ({ ...baseDataExport, failureReason, status: DataExportStatus.Failed }));
    const component = await mountCard();
    await flushPromises();

    expect(hasButton(component, "Request export")).toBe(true);
    expect(component.text()).not.toContain(failureReason);
  });

  test("offers the link once the export is ready and unexpired", async () => {
    expect.hasAssertions();

    const generateDataExportLink = vi.fn<(input: string) => string>(() => link);
    trpcMsw.user.readDataExport.query(() => ({
      ...baseDataExport,
      expiresAt: nextDay,
      readyAt: epoch,
      status: DataExportStatus.Ready,
    }));
    trpcMsw.user.generateDataExportLink.mutation(({ input }) => generateDataExportLink(input));
    const component = await mountCard();
    await flushPromises();
    await getButton(component, "Get download link").trigger("click");
    await flushPromises();

    expect(generateDataExportLink).toHaveBeenCalledExactlyOnceWith(id);
    expect(component.get("a").attributes("href")).toBe(link);
  });

  test("withholds the link once the ready export has expired", async () => {
    expect.hasAssertions();

    const generateDataExportLink = vi.fn<(input: string) => string>(() => link);
    // Expiry at the instant of the check is already expired, the server's own boundary
    trpcMsw.user.readDataExport.query(() => ({
      ...baseDataExport,
      expiresAt: epoch,
      readyAt: epoch,
      status: DataExportStatus.Ready,
    }));
    trpcMsw.user.generateDataExportLink.mutation(({ input }) => generateDataExportLink(input));
    const component = await mountCard();
    await flushPromises();

    expect(hasButton(component, "Get download link")).toBe(false);
    expect(component.find("a").exists()).toBe(false);
    expect(generateDataExportLink).not.toHaveBeenCalled();
  });

  test("requests an export when none is in flight", async () => {
    expect.hasAssertions();

    const requestDataExport = vi.fn<() => DataExportInUser>(() => baseDataExport);
    trpcMsw.user.readDataExport.query(() => undefined);
    trpcMsw.user.requestDataExport.mutation(requestDataExport);
    const component = await mountCard();
    await flushPromises();
    await getButton(component, "Request export").trigger("click");
    await flushPromises();

    expect(requestDataExport).toHaveBeenCalledTimes(1);
  });
});
