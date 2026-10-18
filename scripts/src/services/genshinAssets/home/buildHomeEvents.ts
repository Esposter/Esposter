import { readHomeFavourRows } from "#src/services/genshinAssets/home/readHomeFavourRows";
import { GameDataset } from "genshin-world";

// The companions' favoured furnishing suites, as one record of the home dataset: each favour by its companion, the suite,
// Its one-time reward and the talk the companion speaks, sorted by suite and then by companion
export const buildHomeEvents = (): Record<string, unknown> => ({
  [`${GameDataset.Home}/events`]: {
    favours: readHomeFavourRows()
      .map(({ avatarID, furnitureSuitID, rewardID, talkID }) => ({
        avatarId: avatarID,
        furnitureSuitId: furnitureSuitID,
        rewardId: rewardID,
        talkId: talkID,
      }))
      .toSorted(
        (firstFavour, secondFavour) =>
          firstFavour.furnitureSuitId - secondFavour.furnitureSuitId || firstFavour.avatarId - secondFavour.avatarId,
      ),
  },
});
