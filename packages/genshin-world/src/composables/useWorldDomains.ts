import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { DomainSchedule } from "#src/models/domains/DomainSchedule";
import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { BlossomClaimOffer } from "#src/models/originalResin/BlossomClaimOffer";
import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { Landmark } from "#src/models/world/Landmark";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { StormterrorFight } from "#src/services/bosses/stepStormterrorFight";
import type { DomainLevelRow } from "#src/services/domains/computeDomainLevelRows";
import type { DomainChallengeLevel } from "#src/services/domains/domainChallengeLevels";
import type { GroundPoint } from "genshin-engine";
import type { Ref } from "vue";

import { DomainChallengeOutcome } from "#src/models/domains/DomainChallengeOutcome";
import { DomainKind } from "#src/models/domains/DomainKind";
import { GameDataset } from "#src/models/data/GameDataset";
import { domainScheduleSchema } from "#src/models/domains/DomainSchedule";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { readGameDataEntry } from "#src/services/data/readGameDataEntry";
import { claimPetrifiedTree } from "#src/services/domains/claimPetrifiedTree";
import { computeDomainChallengeElapsed } from "#src/services/domains/computeDomainChallengeElapsed";
import { computeDomainLevelRows } from "#src/services/domains/computeDomainLevelRows";
import { computeDomainScenePose } from "#src/services/domains/computeDomainScenePose";
import { computeDomainWaveAfterDefeat } from "#src/services/domains/computeDomainWaveAfterDefeat";
import { createDomainArenaCamp } from "#src/services/domains/createDomainArenaCamp";
import { DOMAIN_CHALLENGE_LEVELS } from "#src/services/domains/domainChallengeLevels";
import { readWeeklyBossDomains } from "#src/services/domains/readWeeklyBossDomains";
import { resolveDomainChallenge } from "#src/services/domains/resolveDomainChallenge";
import { toWeeklyBossSchedule } from "#src/services/domains/toWeeklyBossSchedule";
import { computeJumpPose } from "#src/services/map/computeJumpPose";
import { claimWeeklyBossFirstClear } from "#src/services/bosses/claimWeeklyBossFirstClear";
import { checkIsWeeklyBossFirstClaimable } from "#src/services/bosses/checkIsWeeklyBossFirstClaimable";
import { computeWeeklyBossQuickChallengeDungeonId } from "#src/services/bosses/computeWeeklyBossQuickChallengeDungeonId";
import { markWeeklyBossTopClear } from "#src/services/bosses/markWeeklyBossTopClear";
import { STORMTERROR_FIGHT_START, stepStormterrorFight } from "#src/services/bosses/stepStormterrorFight";
import { grantRewardItems } from "#src/services/reward/grantRewardItems";
import { computeBlossomClaimPrompt } from "#src/services/originalResin/computeBlossomClaimPrompt";
import { getResultAsync } from "@esposter/shared";
import { computed, shallowRef } from "vue";

// The arena a domain's level is entered into: its stand-in beside the entrance, the level it runs, and the reward items its
// Tree grants when cleared
interface DomainArena {
  areaId: string;
  center: GroundPoint;
  domainKind: DomainKind;
  enemyLevel: number;
  entryId: number;
  // Whether the level is its domain's highest tier, which a weekly boss's clear of marks for its first clear to claim
  isTopTier: boolean;
  // The epoch millisecond the arena was entered, which names each wave's camp apart from the one before
  startedAt: number;
  level: DomainChallengeLevel;
  treeRewards: ItemCount[];
}

// A challenge run in the arena: the camp of the wave in play, and the defeats and the time it has counted so far
interface DomainChallengeRun {
  camp: EnemyCamp;
  defeats: number;
  defeatsInWave: number;
  elapsedMilliseconds: number;
  // The poise breaks the arena's enemy took since the last step, which Stormterror's fight counts as shield breaks
  pendingShieldBreaks: number;
  // Stormterror's fight, held only by a run whose arena holds Stormterror
  stormterrorFight?: StormterrorFight;
  waveIndex: number;
}

// The domain entrances the player has unlocked, the one whose screen is open, and the arena its level runs in. A level's
// Waves spawn one after another at the arena, the defeats of the wave in play count toward the level's target, and the
// Challenge ends as the rule says. A clear raises the Petrified Tree the player claims before leaving the domain
export const useWorldDomains = ({
  adventureExp,
  adventureRankTables,
  clearedDomainIds,
  completedMainQuestIds,
  events,
  gameDataBaseUrl,
  getWorldNow,
  inventory,
  jumpTo,
  materialDataMap,
  nameText,
  random,
  rank,
  setInventory,
  setWallet,
  unlockedLandmarks,
  wallet,
}: {
  adventureExp: Ref<number>;
  adventureRankTables: AdventureRankTables;
  clearedDomainIds: Ref<ReadonlySet<string>>;
  completedMainQuestIds: Readonly<Ref<ReadonlySet<string>>>;
  events: WorldEvents;
  gameDataBaseUrl: string;
  getWorldNow: () => Temporal.Instant;
  inventory: Ref<Inventory>;
  jumpTo: (pose: WorldJumpPose) => void;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  nameText: Readonly<Record<string, string>>;
  random: () => number;
  rank: Ref<number>;
  setInventory: (nextInventory: Inventory) => void;
  setWallet: (nextWallet: Wallet) => void;
  unlockedLandmarks: Ref<Landmark[]>;
  wallet: Ref<Wallet>;
}) => {
  const unlockedDomainEntrances = computed(() =>
    unlockedLandmarks.value.filter(
      (landmark): landmark is DomainEntranceLandmark => landmark.kind === LandmarkKind.DomainEntrance,
    ),
  );
  const domainEntrance = shallowRef<DomainEntranceLandmark>();
  const domainSchedule = shallowRef<DomainSchedule>();
  const domainLevelRows = computed<DomainLevelRow[]>(() =>
    domainSchedule.value && domainEntrance.value
      ? computeDomainLevelRows(
          domainSchedule.value,
          DOMAIN_CHALLENGE_LEVELS[domainEntrance.value.entryId] ?? {},
          rank.value,
          getWorldNow(),
        )
      : [],
  );
  // A weekly boss's trounce domain is read from the weekly record, which holds none before a publish, so its schedule is empty then
  const readDomainSchedule = (landmark: DomainEntranceLandmark): Promise<DomainSchedule> =>
    landmark.domainKind === DomainKind.Trounce
      ? readWeeklyBossDomains(gameDataBaseUrl).then((domains) =>
          toWeeklyBossSchedule(domains[String(landmark.entryId)] ?? { levels: [] }),
        )
      : readGameDataEntry(gameDataBaseUrl, GameDataset.Domains, String(landmark.entryId), domainScheduleSchema);
  const openDomain = (landmark: DomainEntranceLandmark) => {
    domainEntrance.value = landmark;
    domainSchedule.value = undefined;
    // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
    getResultAsync(() => readDomainSchedule(landmark)).match(
      (schedule) => {
        if (domainEntrance.value?.id === landmark.id) domainSchedule.value = schedule;
      },
      (error) => {
        console.error(error);
      },
    );
  };

  const domainArena = shallowRef<DomainArena>();
  const domainChallenge = shallowRef<DomainChallengeRun>();
  // Whether a clear has raised the Petrified Tree the player has not claimed yet
  const isDomainTreeRaised = shallowRef(false);
  const domainClaimOffers = shallowRef<BlossomClaimOffer[]>();
  const isDomainChallengeActive = computed(() => domainChallenge.value !== undefined);
  // The camp of the wave in play, which the enemies spawn while the challenge runs
  const domainCamps = computed(() => (domainChallenge.value ? [domainChallenge.value.camp] : []));
  const spawnWaveCamp = (arena: DomainArena, waveIndex: number) =>
    createDomainArenaCamp(
      arena.areaId,
      `domain-${arena.entryId}-${arena.startedAt}-${waveIndex}`,
      arena.center,
      arena.level.waves[waveIndex] ?? [],
      arena.enemyLevel,
      random,
    );
  // A defeat of the wave in play counts toward the level, and the wave that follows spawns when the wave's last enemy falls
  events.on("defeatEnemy", (enemy) => {
    const arena = domainArena.value;
    const challenge = domainChallenge.value;
    if (!arena || !challenge || enemy.campId !== challenge.camp.id) return;
    const defeats = challenge.defeats + 1;
    const defeatsInWave = challenge.defeatsInWave + 1;
    const waveIndex = computeDomainWaveAfterDefeat(arena.level.waves, challenge.waveIndex, defeatsInWave);
    if (waveIndex === challenge.waveIndex) {
      domainChallenge.value = { ...challenge, defeats, defeatsInWave };
      return;
    }
    domainChallenge.value = {
      ...challenge,
      camp: spawnWaveCamp(arena, waveIndex),
      defeats,
      defeatsInWave: 0,
      waveIndex,
    };
  });
  // A poise break on the arena's enemy counts toward Stormterror's shield breaks, which the next step takes in. The break
  // Stands in for the shield, a non-elemental pool the hit does not yet carry an element to count against (PROVISIONAL)
  events.on("poiseBreak", (enemy) => {
    const challenge = domainChallenge.value;
    if (!challenge?.stormterrorFight || enemy.campId !== challenge.camp.id) return;
    domainChallenge.value = { ...challenge, pendingShieldBreaks: challenge.pendingShieldBreaks + 1 };
  });

  // A level entered from the screen fades into its stand-in arena beside the entrance, where its first wave spawns. A level
  // With no challenge data does not enter, and an arena already entered is not entered again
  const enterDomain = (dungeonId: number) => {
    const entrance = domainEntrance.value;
    const schedule = domainSchedule.value;
    if (domainArena.value || !entrance || !schedule) return;
    const scheduledLevel = schedule.levels.find((level) => level.dungeonId === dungeonId);
    const level = scheduledLevel && DOMAIN_CHALLENGE_LEVELS[entrance.entryId]?.[scheduledLevel.recommendedRank];
    if (!scheduledLevel || !level) return;
    const now = getWorldNow().epochMilliseconds;
    const scenePose = computeDomainScenePose(entrance.arrival);
    const arena: DomainArena = {
      areaId: entrance.areaId,
      center: scenePose.point,
      domainKind: entrance.domainKind,
      enemyLevel: scheduledLevel.enemyLevel,
      entryId: entrance.entryId,
      isTopTier:
        scheduledLevel.recommendedRank >= Math.max(...schedule.levels.map(({ recommendedRank }) => recommendedRank)),
      level,
      startedAt: now,
      treeRewards: scheduledLevel.treeRewards,
    };
    domainArena.value = arena;
    const isStormterrorArena = level.waves
      .flat()
      .some(({ enemyKindId }) => enemyKindId === EnemyKindId.StormterrorDvalin);
    domainChallenge.value = {
      camp: spawnWaveCamp(arena, 0),
      defeats: 0,
      defeatsInWave: 0,
      elapsedMilliseconds: 0,
      pendingShieldBreaks: 0,
      stormterrorFight: isStormterrorArena ? STORMTERROR_FIGHT_START : undefined,
      waveIndex: 0,
    };
    jumpTo(scenePose);
  };
  // The player leaves the arena for the entrance: the tree they have not claimed is forfeited with it
  const leaveDomain = () => {
    const entrance = domainEntrance.value;
    domainArena.value = undefined;
    domainChallenge.value = undefined;
    isDomainTreeRaised.value = false;
    domainClaimOffers.value = undefined;
    if (entrance) jumpTo(computeJumpPose(entrance));
  };
  // The challenge's step, each frame and when the party falls. The clock counts only while the world is open. A clear
  // Raises the tree and keeps the player in the arena, while a timed-out or wiped run returns the player to the entrance
  const stepDomainChallenge = ({
    deltaMilliseconds,
    isPlaying,
    partyDown,
  }: {
    deltaMilliseconds: number;
    isPlaying: boolean;
    partyDown: boolean;
  }): string[] => {
    const arena = domainArena.value;
    if (!arena) return [];
    const challenge = domainChallenge.value;
    if (!challenge) {
      if (partyDown) leaveDomain();
      return [];
    }
    const elapsedMilliseconds = computeDomainChallengeElapsed(
      challenge.elapsedMilliseconds,
      deltaMilliseconds,
      isPlaying,
    );
    // Stormterror's fight counts the same clock as the level, and takes in the shield breaks counted since the last step
    const stormterrorStep = challenge.stormterrorFight
      ? stepStormterrorFight(
          challenge.stormterrorFight,
          (elapsedMilliseconds - challenge.elapsedMilliseconds) / 1000,
          challenge.pendingShieldBreaks,
        )
      : undefined;
    const outcome = resolveDomainChallenge(
      {
        defeatTarget: arena.level.defeatTarget,
        defeats: challenge.defeats,
        elapsedMilliseconds,
        timeLimitMilliseconds: arena.level.timeLimitSeconds * 1000,
      },
      { partyDown },
    );
    if (outcome === DomainChallengeOutcome.Running) {
      domainChallenge.value = {
        ...challenge,
        elapsedMilliseconds,
        pendingShieldBreaks: 0,
        stormterrorFight: stormterrorStep?.fight,
      };
      return stormterrorStep?.transitionAttacks ?? [];
    }
    if (outcome === DomainChallengeOutcome.Cleared) {
      domainChallenge.value = undefined;
      // A weekly boss's defeat leaves its weekly blossom where it fell, so its trounce domain raises no tree. Its highest
      // Tier's clear marks the boss's first clear to claim in the handbook
      isDomainTreeRaised.value = arena.domainKind !== DomainKind.Trounce;
      if (arena.domainKind === DomainKind.Trounce && arena.isTopTier)
        clearedDomainIds.value = markWeeklyBossTopClear(clearedDomainIds.value, arena.entryId);
      return [];
    }
    leaveDomain();
    return [];
  };

  // A weekly boss's first clear, claimed once from the handbook: its talent materials go into the bag, and the claim is recorded
  const claimWeeklyBossFirstClearReward = (entryId: number) => {
    if (!checkIsWeeklyBossFirstClaimable(clearedDomainIds.value, entryId)) return;
    const claim = claimWeeklyBossFirstClear(clearedDomainIds.value, String(entryId));
    const granted = grantRewardItems(wallet.value, inventory.value, claim.rewards, nameText, materialDataMap);
    if (!granted) return;
    setWallet(granted.wallet);
    setInventory(granted.inventory);
    clearedDomainIds.value = claim.clearedDomainIds;
  };
  // A weekly boss's quick challenge reads its schedule, enters the tier the rank reaches and starts the fight there. It
  // Resolves whether a level was entered
  const quickChallengeDomain = (landmark: DomainEntranceLandmark, adventureRank: number, isDomainLocked: boolean) =>
    getResultAsync(() => readDomainSchedule(landmark)).match(
      (schedule) => {
        domainEntrance.value = landmark;
        domainSchedule.value = schedule;
        const dungeonId = computeWeeklyBossQuickChallengeDungeonId(schedule.levels, adventureRank, isDomainLocked);
        if (dungeonId === undefined) return false;
        enterDomain(dungeonId);
        return domainArena.value !== undefined;
      },
      (error) => {
        console.error(error);
        return false;
      },
    );
  // Pressing F at the raised tree offers the claims the held resin affords, and offers none where it affords none
  const openDomainTreeClaim = (now: Temporal.Instant) => {
    if (!isDomainTreeRaised.value) return;
    const { offers } = computeBlossomClaimPrompt(BlossomKind.Domain, 0, wallet.value, inventory.value, now);
    domainClaimOffers.value = offers.length > 0 ? offers : undefined;
  };
  const closeDomainTreeClaim = () => {
    domainClaimOffers.value = undefined;
  };
  // Choosing a claim spends its resin and grants the tree's items. The tree is claimed once, by the offer's claims
  const chooseDomainTreeClaim = (offer: BlossomClaimOffer, now: Temporal.Instant) => {
    const arena = domainArena.value;
    if (!arena || !isDomainTreeRaised.value) return;
    domainClaimOffers.value = undefined;
    const claim = claimPetrifiedTree(
      adventureRankTables,
      wallet.value,
      inventory.value,
      offer,
      () => arena.treeRewards,
      adventureExp.value,
      completedMainQuestIds.value,
      now,
      nameText,
      materialDataMap,
    );
    if (!claim) return;
    setWallet(claim.wallet);
    setInventory(claim.inventory);
    adventureExp.value = claim.adventureExp;
    isDomainTreeRaised.value = false;
  };

  return {
    chooseDomainTreeClaim,
    claimWeeklyBossFirstClearReward,
    closeDomainTreeClaim,
    domainArena,
    domainCamps,
    domainClaimOffers,
    domainEntrance,
    domainLevelRows,
    enterDomain,
    isDomainChallengeActive,
    isDomainTreeRaised,
    leaveDomain,
    openDomain,
    openDomainTreeClaim,
    quickChallengeDomain,
    stepDomainChallenge,
    unlockedDomainEntrances,
  };
};
