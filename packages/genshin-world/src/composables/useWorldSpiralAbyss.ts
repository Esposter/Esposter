import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { AbyssArena } from "#src/models/spiralAbyss/AbyssArena";
import type { AbyssBenedictionChoice } from "#src/models/spiralAbyss/AbyssBenedictionChoice";
import type { AbyssBlessingState } from "#src/models/spiralAbyss/AbyssBlessingState";
import type { AbyssCarryMember } from "#src/models/spiralAbyss/AbyssCarryMember";
import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";
import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";
import type { AbyssPeriod } from "#src/models/spiralAbyss/AbyssPeriod";
import type { AbyssProgress } from "#src/models/spiralAbyss/AbyssProgress";
import type { AbyssRewards } from "#src/models/spiralAbyss/AbyssRewards";
import type { Party } from "#src/models/party/Party";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { Ref } from "vue";

import { applyAbyssBlessingReaction } from "#src/services/spiralAbyss/applyAbyssBlessingReaction";
import { applyAbyssCarry } from "#src/services/spiralAbyss/applyAbyssCarry";
import { checkIsAbyssChallengeCleared } from "#src/services/spiralAbyss/checkIsAbyssChallengeCleared";
import { checkIsAbyssChallengeFailed } from "#src/services/spiralAbyss/checkIsAbyssChallengeFailed";
import { createAbyssArena } from "#src/services/spiralAbyss/createAbyssArena";
import { defeatAbyssArenaEnemy } from "#src/services/spiralAbyss/defeatAbyssArenaEnemy";
import { findAbyssPeriodAt } from "#src/services/spiralAbyss/findAbyssPeriodAt";
import { getAbyssBenedictionAttributeLines } from "#src/services/spiralAbyss/getAbyssBenedictionAttributeLines";
import { getAbyssChamberBlessing } from "#src/services/spiralAbyss/getAbyssChamberBlessing";
import { getAbyssChamberSeconds } from "#src/services/spiralAbyss/getAbyssChamberSeconds";
import { getAbyssCycleKey } from "#src/services/spiralAbyss/getAbyssCycleKey";
import { getAbyssFloorsOffered } from "#src/services/spiralAbyss/getAbyssFloorsOffered";
import { ABYSS_CORRIDOR_LAST_FLOOR_INDEX, ABYSS_ENTRANCE_POSITION } from "#src/services/spiralAbyss/constants";
import { readAbyssBenedictionChoices } from "#src/services/spiralAbyss/readAbyssBenedictionChoices";
import { readAbyssEnemyKinds } from "#src/services/spiralAbyss/readAbyssEnemyKinds";
import { readAbyssFloorRewards } from "#src/services/spiralAbyss/readAbyssFloorRewards";
import { readAbyssFloors } from "#src/services/spiralAbyss/readAbyssFloors";
import { readAbyssPeriods } from "#src/services/spiralAbyss/readAbyssPeriods";
import { settleAbyssClear } from "#src/services/spiralAbyss/settleAbyssClear";
import { stepAbyssArena } from "#src/services/spiralAbyss/stepAbyssArena";
import { getResultAsync } from "@esposter/shared";
import { computed, shallowRef } from "vue";

// A Benediction a Corridor chamber offers before it starts, with the chamber and floor it starts
interface AbyssPendingChoice {
  chamber: AbyssChamber;
  choices: AbyssBenedictionChoice[];
  floor: AbyssFloor;
}

// The blessing state a chamber starts with, before any reaction in it has been answered
const INITIAL_ABYSS_BLESSING_STATE: AbyssBlessingState = { shockwavePositions: [], stardreadReadySeconds: 0 };

// Reads one piece of the Spiral Abyss's game data once, and names a failed read in the console
const readAbyssData = <T>(read: () => Promise<T>, onRead: (value: T) => void) => {
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(read).match(onRead, (error) => {
    console.error(error);
  });
};

// The Spiral Abyss on the world: its periods, floors, enemy kinds, Benedictions and rewards read once, a chamber entered in
// The arena beside the entrance, and the bonus lines the chamber's Benediction gives the party. The arena's camp is fought on
// The domain's mechanism. A clear is settled into the progress of its cycle, its rewards paid and its health and energy carried
// Into the next chamber, and a reaction in a Moon Spire chamber is answered by the period's blessing
export const useWorldSpiralAbyss = ({
  areaId,
  bonusLines,
  events,
  gameDataBaseUrl,
  getWorldNow,
  inventory,
  materialDataMap,
  nameText,
  party,
  savedProgressMap,
  setInventory,
  setWallet,
  wallet,
}: {
  areaId: string;
  bonusLines: Ref<AttributeLine[]>;
  events: WorldEvents;
  gameDataBaseUrl: string;
  getWorldNow: () => Temporal.Instant;
  inventory: Ref<Inventory>;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  nameText: Readonly<Record<string, string>>;
  party: Party;
  savedProgressMap: ReadonlyMap<string, AbyssProgress>;
  setInventory: (inventory: Inventory) => void;
  setWallet: (wallet: Wallet) => void;
  wallet: Ref<Wallet>;
}) => {
  const abyssPeriods = shallowRef<AbyssPeriod[]>([]);
  const abyssFloors = shallowRef<AbyssFloor[]>([]);
  const abyssEnemyKinds = shallowRef<Record<string, number>>({});
  const abyssBenedictionChoices = shallowRef<Record<string, AbyssBenedictionChoice[][]>>({});
  const abyssRewards = shallowRef<AbyssRewards>();
  // The period covering the instant the entrance was opened, which the entry's blessing and floors come from
  const abyssEntrancePeriod = shallowRef<AbyssPeriod>();
  const abyssPendingChoice = shallowRef<AbyssPendingChoice>();
  const abyssArena = shallowRef<AbyssArena>();
  // The progress of each cycle, keyed as the save keys it, replaced whole on each clear so the save sync sees the change
  const abyssProgressMap = shallowRef<ReadonlyMap<string, AbyssProgress>>(new Map(savedProgressMap));
  // The Moon Spire period the running chamber is fought in, none for a Corridor chamber, and what the blessing has done in its arena
  const abyssChamberPeriod = shallowRef<AbyssPeriod>();
  const abyssBlessingState = shallowRef<AbyssBlessingState>(INITIAL_ABYSS_BLESSING_STATE);
  // The health and energy the last clear leaves the party with, which the next chamber starts from
  const abyssCarry = shallowRef<AbyssCarryMember[]>([]);

  readAbyssData(
    () => readAbyssPeriods(gameDataBaseUrl),
    (periods) => {
      abyssPeriods.value = periods;
    },
  );
  readAbyssData(
    () => readAbyssFloors(gameDataBaseUrl),
    (floors) => {
      abyssFloors.value = floors;
    },
  );
  readAbyssData(
    () => readAbyssEnemyKinds(gameDataBaseUrl),
    (enemyKinds) => {
      abyssEnemyKinds.value = enemyKinds;
    },
  );
  readAbyssData(
    () => readAbyssBenedictionChoices(gameDataBaseUrl),
    (choices) => {
      abyssBenedictionChoices.value = choices;
    },
  );
  readAbyssData(
    () => readAbyssFloorRewards(gameDataBaseUrl),
    (rewards) => {
      abyssRewards.value = rewards;
    },
  );

  const abyssBlessing = computed(() => abyssEntrancePeriod.value?.blessing);
  const abyssArenaBlessing = computed(() => abyssChamberPeriod.value?.blessing);
  const abyssFloorsOffered = computed(() => getAbyssFloorsOffered(abyssFloors.value, abyssEntrancePeriod.value));
  const abyssChoices = computed(() => abyssPendingChoice.value?.choices);
  // The camp of the half in play, which the enemies spawn while the chamber runs
  const abyssCamps = computed(() => {
    const camp = abyssArena.value?.camp;
    return camp ? [camp] : [];
  });

  // The entrance opened: the period covering now gives the entry its blessing and the floors it offers
  const openAbyssEntrance = () => {
    abyssEntrancePeriod.value = findAbyssPeriodAt(abyssPeriods.value, getWorldNow());
  };
  // A chamber's arena starts on the party set, and a Benediction's lines hold for the chamber alone, so a refused arena keeps none.
  // The carry of the last clear lands on the members still in the party as the chamber starts, and is spent with it
  const startAbyssChamber = (floor: AbyssFloor, chamber: AbyssChamber, towerBuffId?: number) => {
    const teams = party.teams.filter(({ characterIds }) => characterIds.length > 0).slice(0, floor.teamCount);
    const arena = createAbyssArena(
      floor,
      chamber,
      teams,
      abyssEnemyKinds.value,
      areaId,
      ABYSS_ENTRANCE_POSITION,
      getWorldNow().epochMilliseconds,
    );
    if (arena === undefined) return;
    abyssArena.value = arena;
    abyssChamberPeriod.value = floor.index > ABYSS_CORRIDOR_LAST_FLOOR_INDEX ? abyssEntrancePeriod.value : undefined;
    abyssBlessingState.value = INITIAL_ABYSS_BLESSING_STATE;
    const carried = abyssCarry.value.filter(({ characterId }) => party.characterIdMemberMap.has(characterId));
    if (carried.length > 0) party.characterIdMemberMap = applyAbyssCarry(party.characterIdMemberMap, carried);
    abyssCarry.value = [];
    bonusLines.value = towerBuffId === undefined ? [] : getAbyssBenedictionAttributeLines(towerBuffId);
  };
  // A chamber picked at the entry: a Corridor chamber offers its Benedictions first, a Moon Spire chamber starts at once, and a
  // Chamber nothing offers is not entered
  const enterAbyssChamber = (floorId: number, chamberId: number) => {
    const floor = abyssFloors.value.find(({ id }) => id === floorId);
    const chamber = floor?.chambers.find(({ id }) => id === chamberId);
    if (!floor || !chamber || abyssArena.value || abyssPendingChoice.value) return;
    const blessing = getAbyssChamberBlessing(
      floor,
      abyssPeriods.value,
      abyssBenedictionChoices.value[String(chamber.id)] ?? [],
      getWorldNow(),
    );
    if (blessing === undefined) return;
    if (blessing.kind === "choices") {
      abyssPendingChoice.value = { chamber, choices: blessing.choices, floor };
      return;
    }
    startAbyssChamber(floor, chamber);
  };
  // The Benediction the party takes starts the chamber it was offered for, with its lines on the party
  const chooseAbyssBenediction = (towerBuffId: number) => {
    const pending = abyssPendingChoice.value;
    if (!pending) return;
    abyssPendingChoice.value = undefined;
    startAbyssChamber(pending.floor, pending.chamber, towerBuffId);
  };

  // A chamber over, cleared or failed. A clear is settled into its cycle's progress with its first-time rewards paid, and carries
  // The party into the next chamber. A clear whose rewards the bag cannot take, or whose rewards have not read, is not recorded,
  // And the console names it. Either way the arena and the Benediction's lines end
  const endAbyssChamber = (arena: AbyssArena) => {
    const period = abyssChamberPeriod.value;
    abyssArena.value = undefined;
    abyssChamberPeriod.value = undefined;
    bonusLines.value = [];
    if (!checkIsAbyssChallengeCleared(arena.challenge)) return;
    const rewards = abyssRewards.value;
    const reward = rewards?.floorRewards.find(({ floorIndex }) => floorIndex === arena.floor.index);
    if (rewards === undefined || reward === undefined) {
      console.error(`no rewards read for floor ${arena.floor.index}, so its stars are not recorded`);
      return;
    }
    const cycleKey = getAbyssCycleKey(arena.floor, period);
    if (cycleKey === undefined) {
      console.error(`no Moon Spire period for floor ${arena.floor.index}, so its stars are not recorded`);
      return;
    }
    const settlement = settleAbyssClear({
      challenge: arena.challenge,
      chamber: arena.chamber,
      characterIdMemberMap: party.characterIdMemberMap,
      floor: arena.floor,
      inventory: inventory.value,
      materialDataMap,
      names: nameText,
      progress: abyssProgressMap.value.get(cycleKey) ?? {
        chamberIdProgressMap: new Map(),
        claimedRewardIds: new Set(),
      },
      reward,
      rewardItems: rewards.rewardItems,
      wallet: wallet.value,
    });
    if (settlement === undefined) {
      console.error(`the bag has no room for floor ${arena.floor.index}'s rewards, so its clear is not recorded`);
      return;
    }
    setInventory(settlement.inventory);
    setWallet(settlement.wallet);
    abyssProgressMap.value = new Map(abyssProgressMap.value).set(cycleKey, settlement.progress);
    abyssCarry.value = settlement.carry;
  };
  const settleAbyssArena = (arena: AbyssArena) => {
    if (checkIsAbyssChallengeCleared(arena.challenge) || checkIsAbyssChallengeFailed(arena.challenge))
      endAbyssChamber(arena);
    else abyssArena.value = arena;
  };

  // A defeat of the camp in play counts toward its half, and the chamber settles when its last enemy falls
  events.on("defeatEnemy", (enemy) => {
    const arena = abyssArena.value;
    if (!arena?.camp || enemy.campId !== arena.camp.id) return;
    settleAbyssArena(defeatAbyssArenaEnemy(arena, enemy.campId));
  });
  // A reaction on an enemy of the camp in play is answered by the chamber's period blessing, on the chamber's clock
  events.on("reactionTriggered", (enemy, reactions) => {
    const arena = abyssArena.value;
    if (!arena?.camp || enemy.campId !== arena.camp.id) return;
    const seconds = getAbyssChamberSeconds(arena.floor.index) - arena.challenge.secondsLeft;
    abyssBlessingState.value = applyAbyssBlessingReaction(
      abyssArenaBlessing.value,
      abyssBlessingState.value,
      enemy.position,
      reactions,
      seconds,
    );
  });

  // The arena's clock, stepped each frame and when the party falls. The clock counts only while the world is open, and a
  // Party down ends the chamber without its stars
  const stepAbyss = ({
    deltaMilliseconds,
    isPlaying,
    partyDown,
  }: {
    deltaMilliseconds: number;
    isPlaying: boolean;
    partyDown: boolean;
  }) => {
    const arena = abyssArena.value;
    if (!arena) return;
    if (partyDown) {
      endAbyssChamber(arena);
      return;
    }
    if (!isPlaying) return;
    settleAbyssArena(stepAbyssArena(arena, deltaMilliseconds / 1000));
  };

  return {
    abyssBlessing,
    abyssCamps,
    abyssChoices,
    abyssFloorsOffered,
    abyssProgressMap,
    chooseAbyssBenediction,
    enterAbyssChamber,
    openAbyssEntrance,
    stepAbyss,
  };
};
