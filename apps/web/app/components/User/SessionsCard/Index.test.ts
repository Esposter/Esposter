// @vitest-environment nuxt
import type { SessionSummary } from "#server/models/session/SessionSummary";

import UiErrorState from "@/components/Ui/ErrorState.vue";
import UserSessionsCard from "@/components/User/SessionsCard/Index.vue";
import UserSessionsCardRow from "@/components/User/SessionsCard/Row.vue";
import UserSettingsListSkeleton from "@/components/User/Settings/ListSkeleton.vue";
import { UserSettingsPageSection } from "@/models/user/UserSettingsPageSection";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

const mountCard = () => mountSuspended(UserSessionsCard, { props: { section: UserSettingsPageSection.Sessions } });

describe("userSessionsCard", () => {
  const { trpcMsw } = setupMswTrpc();
  const session: SessionSummary = {
    deviceLabel: "a",
    id: crypto.randomUUID(),
    isCurrent: false,
    updatedAt: new Date(0),
  };

  test("draws the loading rows while the sessions are out", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    trpcMsw.session.readSessions.query(async () => {
      await readGate;
      return [session];
    });
    const component = await mountCard();

    expect(component.findComponent(UserSettingsListSkeleton).exists()).toBe(true);
    expect(component.findComponent(UserSessionsCardRow).exists()).toBe(false);

    releaseRead();
    await flushPromises();
  });

  test("a failed read draws the error state, and its retry reads the sessions again", async () => {
    expect.hasAssertions();

    const readSessions = vi
      .fn<() => SessionSummary[]>()
      .mockImplementationOnce(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
      })
      .mockReturnValue([session]);
    trpcMsw.session.readSessions.query(readSessions);
    const component = await mountCard();
    await flushPromises();

    expect(component.findComponent(UiErrorState).exists()).toBe(true);

    await component.findComponent(UiErrorState).get("button").trigger("click");
    await flushPromises();

    expect(readSessions).toHaveBeenCalledTimes(2);
    expect(component.findAllComponents(UserSessionsCardRow)).toHaveLength(1);
  });
});
