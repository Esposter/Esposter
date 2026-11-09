// @vitest-environment nuxt
import type { PointsLeaderboard } from "#shared/models/achievement/PointsLeaderboard";

import AchievementLeaderboardCard from "@/components/Achievement/Leaderboard/Card.vue";
import AchievementLeaderboard from "@/components/Achievement/Leaderboard/Index.vue";
import UiErrorState from "@/components/Ui/ErrorState.vue";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

describe("achievementLeaderboard", () => {
  const { trpcMsw } = setupMswTrpc();
  const leaderboard: PointsLeaderboard = { entries: [] };

  test("draws the loading rows while the leaderboard is out", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    trpcMsw.achievement.readPointsLeaderboard.query(async () => {
      await readGate;
      return leaderboard;
    });
    const component = await mountSuspended(AchievementLeaderboard);

    expect(component.find('[aria-busy="true"]').exists()).toBe(true);
    expect(component.findComponent(AchievementLeaderboardCard).exists()).toBe(false);

    releaseRead();
    await flushPromises();
  });

  test("a failed read draws the error state, and its retry reads the leaderboard again", async () => {
    expect.hasAssertions();

    const readPointsLeaderboard = vi
      .fn<() => PointsLeaderboard>()
      .mockImplementationOnce(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
      })
      .mockReturnValue(leaderboard);
    trpcMsw.achievement.readPointsLeaderboard.query(readPointsLeaderboard);
    const component = await mountSuspended(AchievementLeaderboard);
    await flushPromises();

    expect(component.findComponent(UiErrorState).exists()).toBe(true);

    await component.get("button").trigger("click");
    await flushPromises();

    expect(readPointsLeaderboard).toHaveBeenCalledTimes(2);
    expect(component.findComponent(AchievementLeaderboardCard).exists()).toBe(true);
  });
});
