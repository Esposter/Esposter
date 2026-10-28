import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { ArtifactMainAffixPool } from "#src/models/artifact/ArtifactMainAffixPool";
import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";
import type { StormterrorFight } from "#src/models/bosses/StormterrorFight";
import type { DomainChallengeLevel } from "#src/models/domains/DomainChallengeLevel";
import type { DomainChallengeLevelMap } from "#src/models/domains/DomainChallengeLevelMap";
import type { DomainDisorderTrigger } from "#src/models/domains/DomainDisorderTrigger";
import type { DomainLevelRow } from "#src/models/domains/DomainLevelRow";
import type { DomainSchedule } from "#src/models/domains/DomainSchedule";
import type { TreeArtifact } from "#src/models/domains/TreeArtifact";
import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { BlossomClaimOffer } from "#src/models/originalResin/BlossomClaimOffer";
import type { Party } from "#src/models/party/Party";
import type { ReliquaryPieceEntry } from "#src/models/reliquary/ReliquaryPieceEntry";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";
import type { RewardItem } from "#src/models/reward/RewardItem";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { Landmark } from "#src/models/world/Landmark";
import type { WorldBagDependencies } from "#src/models/world/WorldBagDependencies";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { GroundPoint } from "genshin-engine";
import type { Ref } from "vue";

import { GameDataset } from "#src/models/data/GameDataset";
import { DomainChallengeOutcome } from "#src/models/domains/DomainChallengeOutcome";
import { DomainKind } from "#src/models/domains/DomainKind";
import { domainScheduleSchema } from "#src/models/domains/DomainSchedule";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { checkIsWeeklyBossFirstClaimable } from "#src/services/bosses/checkIsWeeklyBossFirstClaimable";
import { claimWeeklyBossFirstClear } from "#src/services/bosses/claimWeeklyBossFirstClear";
import { computeWeeklyBossQuickChallengeDungeonId } from "#src/services/bosses/computeWeeklyBossQuickChallengeDungeonId";
import { markWeeklyBossTopClear } from "#src/services/bosses/markWeeklyBossTopClear";
import { stepStormterrorFight, STORMTERROR_FIGHT_START } from "#src/services/bosses/stepStormterrorFight";
import { readGameDataEntry } from "#src/services/data/readGameDataEntry";
import { applyDomainDisorder } from "#src/services/domains/applyDomainDisorder";
import { checkIsDomainLevelOpen } from "#src/services/domains/checkIsDomainLevelOpen";
import { claimPetrifiedTree } from "#src/services/domains/claimPetrifiedTree";
import { clearDomainDisorders } from "#src/services/domains/clearDomainDisorders";
import { computeDomainChallengeElapsed } from "#src/services/domains/computeDomainChallengeElapsed";
import { computeDomainLevelRows } from "#src/services/domains/computeDomainLevelRows";
import { computeDomainScenePose } from "#src/services/domains/computeDomainScenePose";
import { computeDomainWaveAfterDefeat } from "#src/services/domains/computeDomainWaveAfterDefeat";
import { createDomainArenaCamp } from "#src/services/domains/createDomainArenaCamp";
import { drawDomainArtifacts } from "#src/services/domains/drawDomainArtifacts";
import { readWeeklyBossDomains } from "#src/services/domains/readWeeklyBossDomains";
import { resolveDomainChallenge } from "#src/services/domains/resolveDomainChallenge";
import { toWeeklyBossSchedule } from "#src/services/domains/toWeeklyBossSchedule";
import { triggerDomainDisorder } from "#src/services/domains/triggerDomainDisorder";
import { addDroppedItem } from "#src/services/inventory/addDroppedItem";
import { getDroppedItemDefinition } from "#src/services/inventory/getDroppedItemDefinition";
import { computeJumpPose } from "#src/services/map/computeJumpPose";
import { computeBlossomClaimPrompt } from "#src/services/originalResin/computeBlossomClaimPrompt";
import { grantRewardItems } from "#src/services/reward/grantRewardItems";
import { getResultAsync, getSynchronizedFunction } from "@esposter/shared";
import { computed, shallowRef } from "vue";

// The arena a domain's level is entered into: its stand-in beside the entrance, the level it runs, and the reward items its
// Tree grants when cleared
interface DomainArena {
  areaId: string;
  artifactSetIds: readonly number[];
  center: GroundPoint;
  disorder: string;
  domainKind: DomainKind;
  enemyLevel: number;
  entryId: number;
  // Whether the level is its domain's highest tier, which a weekly boss's clear of marks for its first clear to claim
  isTopTier: boolean;
  level: DomainChallengeLevel;
  // The epoch millisecond the arena was entered, which names each wave's camp apart from the one before
  startedAt: number;
  treeArtifacts: TreeArtifact[];
  treeRewards: RewardItem[];
}

// A challenge run in the arena: the camp of the wave in play, and the defeats and the time it has counted so far
interface DomainChallengeRun {
  camp: EnemyCamp;
  defeats: number;
  defeatsInWave: number;
  elapsedMilliseconds: number;
  // The shield breaks the arena's enemy took since the last step, which Stormterror's fight counts
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
  artifactMainAffixPools,
  artifactRarityDataMap,
  clearedDomainIds,
  completedMainQuestIds,
  domainChallengeLevels,
  events,
  gameDataBaseUrl,
  getWorldNow,
  inventory,
  jumpTo,
  kitEffectState,
  materialDataMap,
  nameText,
  party,
  random,
  rank,
  reliquaryPieceEntryMap,
  reliquarySets,
  setInventory,
  setWallet,
  unlockedLandmarks,
  wallet,
  weaponDataMap,
  worldNow,
}: WorldBagDependencies & {
  adventureExp: Ref<number>;
  adventureRankTables: AdventureRankTables;
  artifactMainAffixPools: ArtifactMainAffixPool[];
  artifactRarityDataMap: ReadonlyMap<number, ArtifactRarityData>;
  clearedDomainIds: Ref<ReadonlySet<string>>;
  completedMainQuestIds: Readonly<Ref<ReadonlySet<string>>>;
  domainChallengeLevels: DomainChallengeLevelMap;
  events: WorldEvents;
  gameDataBaseUrl: string;
  getWorldNow: () => Temporal.Instant;
  jumpTo: (pose: WorldJumpPose) => void;
  kitEffectState: KitEffectState;
  party: Party;
  random: () => number;
  rank: Ref<number>;
  reliquaryPieceEntryMap: ReadonlyMap<number, ReliquaryPieceEntry>;
  reliquarySets: readonly ReliquarySetData[];
  unlockedLandmarks: Ref<Landmark[]>;
  weaponDataMap: ReadonlyMap<number, WeaponData>;
  worldNow: Readonly<Ref<Temporal.Instant>>;
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
          domainChallengeLevels[domainEntrance.value.entryId] ?? {},
          rank.value,
          worldNow.value,
        )
      : [],
  );
  // A weekly boss's trounce domain is read from the weekly record, which holds none before a publish, so its schedule is empty then
  const readDomainSchedule = async (landmark: DomainEntranceLandmark): Promise<DomainSchedule> => {
    if (landmark.domainKind === DomainKind.Trounce) {
      const domains = await readWeeklyBossDomains(gameDataBaseUrl);
      return toWeeklyBossSchedule(domains[String(landmark.entryId)] ?? { levels: [] });
    }
    return readGameDataEntry(gameDataBaseUrl, GameDataset.Domains, String(landmark.entryId), domainScheduleSchema);
  };
  const openDomain = (landmark: DomainEntranceLandmark) => {
    domainEntrance.value = landmark;
    domainSchedule.value = undefined;
    getSynchronizedFunction(async () => {
      await getResultAsync(() => readDomainSchedule(landmark)).match(
        (schedule) => {
          if (domainEntrance.value?.id === landmark.id) domainSchedule.value = schedule;
        },
        (error) => {
          console.error(error);
        },
      );
    })();
  };

  const domainArena = shallowRef<DomainArena>();
  const domainChallenge = shallowRef<DomainChallengeRun>();
  // The seconds a triggered disorder may trigger again from, read off the challenge's clock and reset as each arena is entered
  let disorderReadySeconds = 0;
  // Whether a clear has raised the Petrified Tree the player has not claimed yet
  const isDomainTreeRaised = shallowRef(false);
  const domainClaimOffers = shallowRef<BlossomClaimOffer[]>();
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
  // A shield break on the arena's enemy counts toward Stormterror's shield breaks, which the next step takes in
  events.on("shieldBreak", (enemy) => {
    const challenge = domainChallenge.value;
    if (!challenge?.stormterrorFight || enemy.campId !== challenge.camp.id) return;
    domainChallenge.value = { ...challenge, pendingShieldBreaks: challenge.pendingShieldBreaks + 1 };
  });

  // A disorder that triggers on the fight is answered while its challenge runs, its cooldown read off the challenge's clock,
  // Which pauses with the world as the challenge's own does
  const triggerDisorder = (trigger: DomainDisorderTrigger) => {
    const arena = domainArena.value;
    const challenge = domainChallenge.value;
    if (!arena || !challenge) return;
    disorderReadySeconds = triggerDomainDisorder(
      kitEffectState,
      party,
      arena.disorder,
      trigger,
      challenge.elapsedMilliseconds / 1000,
      disorderReadySeconds,
    );
  };
  events.on("partyHealthChanged", ({ healthShare }) => {
    triggerDisorder({ healthShare, kind: "healthChange" });
  });
  events.on("reactionTriggered", (_enemy, reactions) => {
    triggerDisorder({ kind: "reaction", reactions });
  });

  // A level entered from the screen fades into its stand-in arena beside the entrance, where its first wave spawns. A level
  // With no challenge data or closed at the moment does not enter, and an arena already entered is not entered again
  const enterDomain = (dungeonId: number) => {
    const entrance = domainEntrance.value;
    const schedule = domainSchedule.value;
    if (domainArena.value || !entrance || !schedule) return;
    const scheduledLevel = schedule.levels.find((level) => level.dungeonId === dungeonId);
    const level = scheduledLevel && domainChallengeLevels[entrance.entryId]?.[scheduledLevel.recommendedRank];
    if (!scheduledLevel || !level) return;
    const now = getWorldNow();
    // The row the player pressed was read at the world's clock, which can be a minute behind a reset that has passed since
    if (!checkIsDomainLevelOpen(schedule.kind, scheduledLevel, rank.value, now)) return;
    const scenePose = computeDomainScenePose(entrance.arrival);
    const arena: DomainArena = {
      areaId: entrance.areaId,
      artifactSetIds: schedule.artifactSetIds,
      center: scenePose.point,
      disorder: scheduledLevel.disorder,
      domainKind: entrance.domainKind,
      enemyLevel: scheduledLevel.enemyLevel,
      entryId: entrance.entryId,
      isTopTier:
        scheduledLevel.recommendedRank >= Math.max(...schedule.levels.map(({ recommendedRank }) => recommendedRank)),
      level,
      startedAt: now.epochMilliseconds,
      treeArtifacts: scheduledLevel.treeArtifacts,
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
    disorderReadySeconds = 0;
    applyDomainDisorder(kitEffectState, party, scheduledLevel.disorder, level.timeLimitSeconds);
    jumpTo(scenePose);
  };
  // The player leaves the arena for the entrance: the tree they have not claimed is forfeited with it
  const leaveDomain = () => {
    const entrance = domainEntrance.value;
    clearDomainDisorders(kitEffectState);
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
    isPartyDown,
    isPlaying,
  }: {
    deltaMilliseconds: number;
    isPartyDown: boolean;
    isPlaying: boolean;
  }): string[] => {
    const arena = domainArena.value;
    if (!arena) return [];
    const challenge = domainChallenge.value;
    if (!challenge) {
      if (isPartyDown) leaveDomain();
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
        defeats: challenge.defeats,
        defeatTarget: arena.level.defeatTarget,
        elapsedMilliseconds,
        timeLimitMilliseconds: arena.level.timeLimitSeconds * 1000,
      },
      { isPartyDown },
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
    // Each claim draws its artifacts apart from the domain's sets before the resin is spent, so a domain with none to draw
    // From is refused with the resin still held
    const artifacts = Array.from({ length: offer.claimCount }, () =>
      drawDomainArtifacts(arena.treeArtifacts, arena.artifactSetIds, reliquarySets, random, {
        artifactMainAffixPools,
        artifactRarityDataMap,
      }),
    ).flat();
    const claim = claimPetrifiedTree(
      adventureRankTables,
      wallet.value,
      inventory.value,
      offer,
      arena.treeRewards,
      random,
      adventureExp.value,
      completedMainQuestIds.value,
      now,
      nameText,
      materialDataMap,
    );
    if (!claim) return;
    // Each artifact goes into the bag as an entry of its own with the stats it rolled, so each one keeps its own
    const nextInventory = artifacts.reduce(
      (bag, dropped) =>
        addDroppedItem(
          bag,
          dropped,
          getDroppedItemDefinition(dropped.itemId, nameText, weaponDataMap, materialDataMap, reliquaryPieceEntryMap),
        ).inventory,
      claim.inventory,
    );
    setWallet(claim.wallet);
    setInventory(nextInventory);
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
    isDomainTreeRaised,
    leaveDomain,
    openDomain,
    openDomainTreeClaim,
    quickChallengeDomain,
    stepDomainChallenge,
    unlockedDomainEntrances,
  };
};
