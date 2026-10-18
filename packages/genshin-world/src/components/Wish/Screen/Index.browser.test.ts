import type { Trial } from "#src/models/trial/Trial";
import type { WishItem } from "#src/models/wish/WishItem";

import { props } from "#src/components/Wish/Screen/Index.fixture";
import WishScreen from "#src/components/Wish/Screen/Index.vue";
import { GameTextKey } from "genshin-text";
import { WishItemKind } from "#src/models/wish/WishItemKind";
import { createBanners } from "#src/services/wish/createBanners";
import { getOpenEventBanners } from "#src/services/wish/getOpenEventBanners";
import { BannerKind } from "genshin-interface";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

// The character the Character Event banner the fixture opens on features, at the clock the fixture holds
const featuredCharacterOf = (): WishItem => {
  const openBanners = createBanners(
    props.statTables,
    props.nameText,
    getOpenEventBanners(
      props.wishSchedule,
      Temporal.Now.instant().add({ milliseconds: props.serverClockOffsetMs }).epochMilliseconds,
    ),
  );
  const featured = openBanners
    .find(({ kind }) => kind === BannerKind.CharacterEvent)
    ?.featuredFiveStars.find(({ kind }) => kind === WishItemKind.Character);
  if (!featured) throw new Error("the fixture's Character Event banner features no character");
  return featured;
};

describe("wishScreen", () => {
  test("a banner whose featured character has a trial offers the trial, and the trial opens it", async () => {
    expect.hasAssertions();

    const character = featuredCharacterOf();
    const trial: Trial = { characterId: character.id, level: 85, trialId: 1022 };
    const onTrial = vi.fn<(trial: Trial) => void>();
    render(WishScreen, { attrs: { onTrial }, props: { ...props, trials: [trial], wishHistory: [] } });

    await page.getByRole("button", { exact: true, name: props.gameText[GameTextKey.WishGoToTrial] }).click();

    expect(onTrial).toHaveBeenCalledExactlyOnceWith(trial);
  });

  test("a banner whose featured character has no trial offers no trial button", async () => {
    expect.hasAssertions();

    const character = featuredCharacterOf();
    render(WishScreen, { props: { ...props, trials: [], wishHistory: [] } });

    // The card names the featured character once the banner is shown, so the button's absence is checked on a drawn screen
    await expect.element(page.getByText(character.name, { exact: true })).toBeVisible();
    expect(
      page.getByRole("button", { exact: true, name: props.gameText[GameTextKey.WishGoToTrial] }).query(),
    ).toBeNull();
  });
});
