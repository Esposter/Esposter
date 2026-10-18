import type { GatheringPlace } from "#src/models/gathering/GatheringPlace";
import type { OreHit } from "#src/models/gathering/OreHit";
import type { KitBody } from "#src/models/kit/KitBody";
import type { Ref } from "vue";

import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { computeDailyMiningOutcrops } from "#src/services/gathering/computeDailyMiningOutcrops";
import { computeStandingMiningOutcrops } from "#src/services/gathering/computeStandingMiningOutcrops";
import { OreItemIdBreakPoiseMap } from "#src/services/gathering/OreItemIdBreakPoiseMap";
import { readMiningOutcropPlaces } from "#src/services/gathering/readMiningOutcropPlaces";
import { strikeOre } from "#src/services/gathering/strikeOre";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { checkIsOutcropDayCurrent } from "#src/services/leyLine/checkIsOutcropDayCurrent";
import { computeShopRefreshTime } from "#src/services/shop/computeShopRefreshTime";
import { getResultAsync } from "@esposter/shared";
import { watchImmediate } from "@vueuse/core";
import { shallowRef } from "vue";

// The mining outcrops of each region the world has loaded: a region's places are read once, and its daily reset draws
// Its outcrops to stand at them until the next reset. A strike breaks one like an ore, dropping its Magical Crystal Chunks
// And leaving it gone until the next reset's draw
export const useMiningOutcrops = ({
  breakOre,
  gameDataBaseUrl,
  getWorldNow,
  rank,
  regionIds,
}: {
  breakOre: (place: Pick<GatheringPlace, "id" | "kind" | "position">, random: () => number) => void;
  gameDataBaseUrl: string;
  getWorldNow: () => Temporal.Instant;
  rank: Readonly<Ref<number>>;
  regionIds: Readonly<Ref<string[]>>;
}) => {
  // Each region's places, read as the world loads it. A region no publish wrote holds none, so it draws none
  const placesMap = shallowRef(new Map<string, GatheringPlace[]>());
  const requestedRegionIds = new Set<string>();
  // Each region's day's draw: the reset it was drawn at, and the places drawn
  const drawnMap = shallowRef(new Map<string, { at: Temporal.Instant; placeIds: string[] }>());
  const minedAtMap = shallowRef(new Map<string, Temporal.Instant>());
  const brokenShareMap = shallowRef(new Map<string, number>());
  const standingMiningOutcrops = shallowRef<GatheringPlace[]>([]);
  watchImmediate(regionIds, (ids) => {
    for (const regionId of ids) {
      if (requestedRegionIds.has(regionId)) continue;
      requestedRegionIds.add(regionId);
      getResultAsync(() => readMiningOutcropPlaces(gameDataBaseUrl, regionId)).match(
        (places) => {
          placesMap.value = new Map([...placesMap.value, [regionId, places]]);
        },
        (error) => {
          console.error(error);
        },
      );
    }
  });
  // A region without a draw for the day's reset draws now, at that reset, from the places it has
  const drawDayMiningOutcrops = (now: Temporal.Instant, random: () => number) => {
    const at = computeShopRefreshTime(ShopRefresh.Daily, now);
    for (const [regionId, places] of placesMap.value) {
      const drawn = drawnMap.value.get(regionId);
      if (places.length === 0 || (drawn !== undefined && checkIsOutcropDayCurrent(drawn.at, now))) continue;
      const placeIds = computeDailyMiningOutcrops(
        regionId,
        places.map(({ id }) => id),
        rank.value,
        random,
      );
      drawnMap.value = new Map([...drawnMap.value, [regionId, { at, placeIds }]]);
    }
  };
  // Read each frame, so a place drawn at a reset or come back from its respawn shows at once. The list is replaced only
  // When its places change, so the world's stand-ins are not written each frame
  const refreshMiningOutcrops = (now: Temporal.Instant, random: () => number) => {
    drawDayMiningOutcrops(now, random);
    const standing = [...placesMap.value].flatMap(([regionId, places]) =>
      computeStandingMiningOutcrops(places, drawnMap.value.get(regionId), minedAtMap.value, now),
    );
    const isSameStanding =
      standing.length === standingMiningOutcrops.value.length &&
      standing.every(({ id }, index) => id === standingMiningOutcrops.value[index]?.id);
    if (!isSameStanding) standingMiningOutcrops.value = standing;
  };
  // A strike on a standing mining outcrop wears its break share down as an ore's does. A break drops its ore into the
  // World, and the outcrop is gone until the reset that brings it back
  const strikeMiningOutcrops = (body: KitBody, hit: OreHit, random: () => number) => {
    const now = getWorldNow();
    for (const { id, kind, position } of standingMiningOutcrops.value) {
      const requirement = OreItemIdBreakPoiseMap[kind];
      if (!requirement || !checkIsInAttackArea(hit.hitArea, body, { position })) continue;
      const brokenShare = strikeOre(brokenShareMap.value.get(id) ?? 0, hit, requirement);
      if (brokenShare < 1) {
        brokenShareMap.value = new Map([...brokenShareMap.value, [id, brokenShare]]);
        continue;
      }
      breakOre({ id, kind, position }, random);
      minedAtMap.value = new Map([...minedAtMap.value, [id, now]]);
      brokenShareMap.value = new Map([...brokenShareMap.value].filter(([oreId]) => oreId !== id));
      standingMiningOutcrops.value = standingMiningOutcrops.value.filter((place) => place.id !== id);
    }
  };
  return { placesMap, refreshMiningOutcrops, standingMiningOutcrops, strikeMiningOutcrops };
};
