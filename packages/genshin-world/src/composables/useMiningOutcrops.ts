import type { GatheringPlace } from "#src/models/gathering/GatheringPlace";
import type { MinedOutcrop } from "#src/models/gathering/MinedOutcrop";
import type { OreHit } from "#src/models/gathering/OreHit";
import type { KitBody } from "#src/models/kit/KitBody";
import type { Ref } from "vue";

import { computeDailyMiningOutcrops } from "#src/services/gathering/computeDailyMiningOutcrops";
import { computeStandingMiningOutcrops } from "#src/services/gathering/computeStandingMiningOutcrops";
import { OreItemIdBreakPoiseMap } from "#src/services/gathering/OreItemIdBreakPoiseMap";
import { readMiningOutcropPlaces } from "#src/services/gathering/readMiningOutcropPlaces";
import { strikeOre } from "#src/services/gathering/strikeOre";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { checkIsMiningOutcropStanding } from "#src/services/leyLine/checkIsMiningOutcropStanding";
import { computeLastMiningOutcropDraw } from "#src/services/leyLine/computeLastMiningOutcropDraw";
import { computeNextMiningOutcropRespawn } from "#src/services/leyLine/computeNextMiningOutcropRespawn";
import { getResultAsync } from "@esposter/shared";
import { watchImmediate } from "@vueuse/core";
import { computed, shallowRef } from "vue";

// The mining outcrops of each region the world has loaded: a region's places are read once, and its draw at each 06:00
// Sets its outcrops to stand at them until the next draw. A strike breaks one like an ore, dropping its Magical Crystal
// Chunks and leaving it gone until its respawn. The mined ones are the save's, held until then
export const useMiningOutcrops = ({
  breakOre,
  gameDataBaseUrl,
  getWorldNow,
  rank,
  regionIds,
  savedMinedOutcrops,
}: {
  breakOre: (place: Pick<GatheringPlace, "id" | "kind" | "position">, random: () => number) => void;
  gameDataBaseUrl: string;
  getWorldNow: () => Temporal.Instant;
  rank: Readonly<Ref<number>>;
  regionIds: Readonly<Ref<string[]>>;
  savedMinedOutcrops: readonly MinedOutcrop[];
}) => {
  // Each region's places, read as the world loads it. A region no publish wrote holds none, so it draws none
  const placesMap = shallowRef(new Map<string, GatheringPlace[]>());
  const requestedRegionIds = new Set<string>();
  // Each region's day's draw: the 06:00 it was drawn at, and the places drawn
  const drawnMap = shallowRef(new Map<string, { at: Temporal.Instant; placeIds: string[] }>());
  const minedAtMap = shallowRef(new Map(savedMinedOutcrops.map(({ id, minedAt }) => [id, minedAt] as const)));
  const brokenShareMap = shallowRef(new Map<string, number>());
  const standingMiningOutcrops = shallowRef<GatheringPlace[]>([]);
  watchImmediate(regionIds, async (ids) => {
    const requests: Promise<void>[] = [];
    for (const regionId of ids) {
      if (requestedRegionIds.has(regionId)) continue;
      requestedRegionIds.add(regionId);
      requests.push(
        getResultAsync(() => readMiningOutcropPlaces(gameDataBaseUrl, regionId)).match(
          (places) => {
            placesMap.value = new Map([...placesMap.value, [regionId, places]]);
          },
          (error) => {
            console.error(error);
          },
        ),
      );
    }
    await Promise.all(requests);
  });
  // A region without the current draw draws now, at that 06:00, from the places it has
  const drawDayMiningOutcrops = (now: Temporal.Instant, random: () => number) => {
    const at = computeLastMiningOutcropDraw(now);
    for (const [regionId, places] of placesMap.value) {
      const drawn = drawnMap.value.get(regionId);
      if (places.length === 0 || (drawn !== undefined && Temporal.Instant.compare(drawn.at, at) >= 0)) continue;
      const placeIds = computeDailyMiningOutcrops(
        regionId,
        places.map(({ id }) => id),
        rank.value,
        random,
      );
      drawnMap.value = new Map([...drawnMap.value, [regionId, { at, placeIds }]]);
    }
  };
  // Read each frame, so a place drawn at a draw or come back from its respawn shows at once. A draw reaches the standing
  // Places only through its day's draw, which replaces the draws, and a respawn comes between draws, so they are worked
  // Out again when the places, the draws or the mined map is replaced or the next respawn has come, and the list is
  // Replaced only when its places change
  let standingInputs: readonly unknown[] | undefined;
  let nextRespawnAt: Temporal.Instant | undefined;
  const refreshMiningOutcrops = (now: Temporal.Instant, random: () => number) => {
    drawDayMiningOutcrops(now, random);
    const inputs = [placesMap.value, drawnMap.value, minedAtMap.value];
    if (
      standingInputs?.every((input, index) => input === inputs[index]) &&
      (nextRespawnAt === undefined || Temporal.Instant.compare(now, nextRespawnAt) < 0)
    )
      return;
    standingInputs = inputs;
    nextRespawnAt = computeNextMiningOutcropRespawn(minedAtMap.value.values(), now);
    const standing = [...placesMap.value].flatMap(([regionId, places]) =>
      computeStandingMiningOutcrops(places, drawnMap.value.get(regionId), minedAtMap.value, now),
    );
    const isSameStanding =
      standing.length === standingMiningOutcrops.value.length &&
      standing.every(({ id }, index) => id === standingMiningOutcrops.value[index]?.id);
    if (!isSameStanding) standingMiningOutcrops.value = standing;
  };
  // A strike on a standing mining outcrop wears its break share down as an ore's does. A break drops its ore into the
  // World, and the outcrop is gone until the respawn that brings it back
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
      // The mining keeps only the outcrops still gone at this moment, so the save holds the day's mined ones and no more
      minedAtMap.value = new Map(
        [...minedAtMap.value, [id, now] as const].filter(([, minedAt]) => !checkIsMiningOutcropStanding(minedAt, now)),
      );
      brokenShareMap.value = new Map([...brokenShareMap.value].filter(([oreId]) => oreId !== id));
      standingMiningOutcrops.value = standingMiningOutcrops.value.filter((place) => place.id !== id);
    }
  };
  const minedOutcrops = computed<MinedOutcrop[]>(() =>
    Array.from(minedAtMap.value, ([id, minedAt]) => ({ id, minedAt })),
  );
  return { minedOutcrops, placesMap, refreshMiningOutcrops, standingMiningOutcrops, strikeMiningOutcrops };
};
