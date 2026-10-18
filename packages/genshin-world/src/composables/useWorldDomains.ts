import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { DomainSchedule } from "#src/models/domains/DomainSchedule";
import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { Landmark } from "#src/models/world/Landmark";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { DomainLevelRow } from "#src/services/domains/computeDomainLevelRows";
import type { Ref } from "vue";

import { DomainChallengeOutcome } from "#src/models/domains/DomainChallengeOutcome";
import { GameDataset } from "#src/models/data/GameDataset";
import { domainScheduleSchema } from "#src/models/domains/DomainSchedule";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { readGameDataEntry } from "#src/services/data/readGameDataEntry";
import { computeDomainLevelRows } from "#src/services/domains/computeDomainLevelRows";
import { computeDomainScenePose } from "#src/services/domains/computeDomainScenePose";
import { createDomainArenaCamp } from "#src/services/domains/createDomainArenaCamp";
import { DOMAIN_CHALLENGE_LEVELS } from "#src/services/domains/domainChallengeLevels";
import { resolveDomainChallenge } from "#src/services/domains/resolveDomainChallenge";
import { computeJumpPose } from "#src/services/map/computeJumpPose";
import { getResultAsync } from "@esposter/shared";
import { computed, shallowRef } from "vue";

interface DomainChallenge {
  camp: EnemyCamp;
  defeatTarget: number;
  defeats: number;
  endsAt: number;
  entryId: number;
}

// The domain entrances the player has unlocked, the one whose screen is open, and the challenge run in its arena: its
// Level's stand-in camp spawns beside the entrance, the defeats of that camp count toward the level's target, and the
// Challenge ends as the rule says. A cleared domain raises its Petrified Tree at its entrance, and the player leaves
export const useWorldDomains = ({
  events,
  gameDataBaseUrl,
  getWorldNow,
  jumpTo,
  random,
  rank,
  unlockedLandmarks,
}: {
  events: WorldEvents;
  gameDataBaseUrl: string;
  getWorldNow: () => Temporal.Instant;
  jumpTo: (pose: WorldJumpPose) => void;
  random: () => number;
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
    domainSchedule.value ? computeDomainLevelRows(domainSchedule.value, rank.value, getWorldNow()) : [],
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

  const domainChallenge = shallowRef<DomainChallenge>();
  const isDomainChallengeActive = computed(() => domainChallenge.value !== undefined);
  // The stand-in camp of the challenge running, which the enemies spawn while it runs
  const domainCamps = computed(() => (domainChallenge.value ? [domainChallenge.value.camp] : []));
  // The domains whose Petrified Tree is raised by a clear and not yet claimed
  const raisedTreeEntryIds = shallowRef<ReadonlySet<number>>(new Set());
  events.on("defeatEnemy", (enemy) => {
    const challenge = domainChallenge.value;
    if (challenge && enemy.campId === challenge.camp.id)
      domainChallenge.value = { ...challenge, defeats: challenge.defeats + 1 };
  });

  // A level entered from the screen fades into its stand-in arena beside the entrance, where its challenge's camp spawns
  const enterDomain = (dungeonId: number) => {
    const entrance = domainEntrance.value;
    const schedule = domainSchedule.value;
    // A challenge already running is not restarted, so its timer cannot be reset by entering again from the entrance
    if (domainChallenge.value || !entrance || !schedule) return;
    const levelIndex = schedule.levels.findIndex((level) => level.dungeonId === dungeonId);
    const level = DOMAIN_CHALLENGE_LEVELS[entrance.entryId]?.[levelIndex];
    if (!level) return;
    const now = getWorldNow().epochMilliseconds;
    const scenePose = computeDomainScenePose(entrance.arrival);
    domainChallenge.value = {
      camp: createDomainArenaCamp(
        entrance.areaId,
        `domain-${entrance.entryId}-${now}`,
        scenePose.point,
        level,
        schedule.levels[levelIndex].enemyLevel,
        random,
      ),
      defeatTarget: level.defeatTarget,
      defeats: 0,
      endsAt: now + level.timeLimitSeconds * 1000,
      entryId: entrance.entryId,
    };
    jumpTo(scenePose);
  };
  // The challenge's step, each frame and when the party falls: a challenge that has ended is left, its clear raising the tree
  const stepDomainChallenge = (partyDown: boolean) => {
    const challenge = domainChallenge.value;
    const entrance = domainEntrance.value;
    if (!challenge || !entrance) return;
    const outcome = resolveDomainChallenge(challenge, { now: getWorldNow().epochMilliseconds, partyDown });
    if (outcome === DomainChallengeOutcome.Running) return;
    if (outcome === DomainChallengeOutcome.Cleared)
      raisedTreeEntryIds.value = new Set([...raisedTreeEntryIds.value, challenge.entryId]);
    domainChallenge.value = undefined;
    jumpTo(computeJumpPose(entrance));
  };

  return {
    domainCamps,
    domainEntrance,
    domainLevelRows,
    enterDomain,
    isDomainChallengeActive,
    openDomain,
    raisedTreeEntryIds,
    stepDomainChallenge,
    unlockedDomainEntrances,
  };
};
