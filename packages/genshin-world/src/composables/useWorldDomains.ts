import type { DomainSchedule } from "#src/models/domains/DomainSchedule";
import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { Landmark } from "#src/models/world/Landmark";
import type { DomainLevelRow } from "#src/services/domains/computeDomainLevelRows";
import type { Ref } from "vue";

import { GameDataset } from "#src/models/data/GameDataset";
import { domainScheduleSchema } from "#src/models/domains/DomainSchedule";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { readGameDataEntry } from "#src/services/data/readGameDataEntry";
import { computeDomainLevelRows } from "#src/services/domains/computeDomainLevelRows";
import { GAME_TIME_ZONE } from "#src/services/originalResin/constants";
import { getResultAsync } from "@esposter/shared";
import { computed, shallowRef } from "vue";

// The domain entrances the player has unlocked, and the one whose screen is open: its levels read from the published
// Schedule of its entry, each with the state it is in at the player's rank and today
export const useWorldDomains = ({
  gameDataBaseUrl,
  getWorldNow,
  rank,
  unlockedLandmarks,
}: {
  gameDataBaseUrl: string;
  getWorldNow: () => Temporal.Instant;
  rank: Ref<number>;
  unlockedLandmarks: Ref<Landmark[]>;
}) => {
  const unlockedDomainEntrances = computed(() =>
    unlockedLandmarks.value.filter(
      (landmark): landmark is DomainEntranceLandmark => landmark.kind === LandmarkKind.DomainEntrance,
    ),
  );
  const domainEntrance = shallowRef<DomainEntranceLandmark>();
  const domainSchedule = shallowRef<DomainSchedule>();
  const domainLevelRows = computed<DomainLevelRow[]>(() =>
    domainSchedule.value
      ? computeDomainLevelRows(
          domainSchedule.value,
          rank.value,
          getWorldNow().toZonedDateTimeISO(GAME_TIME_ZONE).toPlainDate(),
        )
      : [],
  );
  const openDomain = (landmark: DomainEntranceLandmark) => {
    domainEntrance.value = landmark;
    domainSchedule.value = undefined;
    // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
    getResultAsync(() =>
      readGameDataEntry(gameDataBaseUrl, GameDataset.Domains, String(landmark.entryId), domainScheduleSchema),
    ).match(
      (schedule) => {
        if (domainEntrance.value?.id === landmark.id) domainSchedule.value = schedule;
      },
      (error) => {
        console.error(error);
      },
    );
  };

  return { domainEntrance, domainLevelRows, openDomain, unlockedDomainEntrances };
};
