import type { GameDataBuild } from "#src/models/shared/GameDataBuild";
import type { FishingPropPlace } from "genshin-world";

import { FISHING_PROP_COMPONENTS } from "#src/services/genshinAssets/fishing/constants";
import { toFishingProps } from "#src/services/genshinAssets/fishing/toFishingProps";
import { readWitnessPlacements } from "#src/services/genshinAssets/fit/readWitnessPlacements";
import { GameDataset } from "genshin-world/definitions";

// The fishing-area props each region's witness layout places, as the Fishing dataset's records keyed by region. The
// Notes print each region's count, then each prop's name, place, turn and scale
export const buildFishingProps = async (): Promise<GameDataBuild> => {
  const regions = await Promise.all(
    FISHING_PROP_COMPONENTS.map(async (component) => ({
      component,
      props: toFishingProps(await readWitnessPlacements(component)),
    })),
  );
  const regionProps: Record<string, FishingPropPlace[]> = Object.fromEntries(
    regions.map(({ component, props }) => [component, props]),
  );
  return {
    notes: regions.flatMap(({ component, props }) => [
      `${component}: ${props.length} fishing-area props`,
      ...props.map(
        ({ name, position, rotation, scale }) =>
          `  ${name} place ${position.join(", ")} turn ${rotation.join(", ")} scale ${scale.join(", ")}`,
      ),
    ]),
    objects: { [`${GameDataset.Fishing}/props`]: regionProps },
  };
};
