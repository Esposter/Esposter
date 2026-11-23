/* oxlint-disable vitest/prefer-import-in-mock -- A partial fake: the typed state machine, dialog and dungeons store have members this test never reads, and the dungeons store would load Phaser */
import type { SceneWithPlugins } from "vue-phaserjs";

import { Save } from "#shared/models/dungeons/data/Save";
import { MonsterKey } from "#shared/models/dungeons/keys/MonsterKey";
import { Monster } from "#shared/models/dungeons/monster/Monster";
import { StateName } from "#src/models/dungeons/state/battle/StateName";
import { getExperienceGain } from "#src/services/dungeons/monster/getExperienceGain";
import { getLevelExperience } from "#src/services/dungeons/monster/getLevelExperience";
import { GainExperience } from "#src/services/dungeons/state/battle/states/GainExperience";
import { phaserEventEmitter } from "#src/services/phaser/phaserEventEmitter";
import { useEnemyStore } from "#src/store/dungeons/battle/enemy";
import { useDungeonsStore } from "#src/store/dungeons/index";
import { useMonsterPartySceneStore } from "#src/store/dungeons/monsterParty/scene";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { setState, showMessages } = vi.hoisted(() => ({
  setState: vi.fn<(stateName: StateName) => Promise<void>>(() => Promise.resolve()),
  showMessages: vi.fn<(scene: SceneWithPlugins, messages: string[]) => Promise<void>>(() => Promise.resolve()),
}));

// The state machine holds every battle state, and the dialog is UI over the scene, so only their calls are recorded
vi.mock("#src/services/dungeons/scene/battle/battleStateMachine", () => ({ battleStateMachine: { setState } }));
vi.mock("#src/store/dungeons/battle/dialog", () => ({ useBattleDialogStore: () => ({ showMessages }) }));

// The dungeons store imports Phaser, which cannot initialise under the test environment
// oxlint-disable-next-line vitest/prefer-import-in-mock -- A partial fake: the typed module would load Phaser and its full store type
vi.mock("#src/store/dungeons/index", () => import("#src/store/dungeons/index.test"));

describe("gainExperience", () => {
  const scene = {} as SceneWithPlugins;
  const enemyMonster = new Monster(MonsterKey.Iguanignite);
  const experienceGain = getExperienceGain(enemyMonster.statistics.baseExperience, enemyMonster.statistics.level);
  let playerMonster: Monster;

  beforeEach(() => {
    setActivePinia(createPinia());
    const dungeonsStore = useDungeonsStore();
    const { save } = storeToRefs(dungeonsStore);
    save.value = new Save();
    // A level 5 player monster needs 125 experience for its next level, so each test sets how close it starts
    playerMonster = new Monster(MonsterKey.Iguanignite);
    const monsterPartySceneStore = useMonsterPartySceneStore();
    const { monsters } = storeToRefs(monsterPartySceneStore);
    monsters.value = [playerMonster];
    const enemyStore = useEnemyStore();
    const { activeMonster } = storeToRefs(enemyStore);
    activeMonster.value = enemyMonster;
    setState.mockClear();
    showMessages.mockClear();
  });

  test("a gain short of the next level is credited once, and the battle finishes straight away", async () => {
    expect.hasAssertions();

    const startExperience = playerMonster.status.experience;
    await GainExperience.onEnter?.(scene);

    expect(playerMonster.status.experience).toBe(startExperience + experienceGain);
    expect(showMessages).toHaveBeenCalledExactlyOnceWith(scene, [`You gained ${experienceGain} experience.`]);
    expect(setState).toHaveBeenCalledExactlyOnceWith(StateName.Finished);
  });

  test("a gain that reaches the next level is credited once, and the battle waits for the level-up to finish", async () => {
    expect.hasAssertions();

    // One experience short of the next level, so any gain reaches it
    playerMonster.status.experience = getLevelExperience(playerMonster.statistics.level) - 1;
    const startExperience = playerMonster.status.experience;
    await GainExperience.onEnter?.(scene);

    expect(playerMonster.status.experience).toBe(startExperience + experienceGain);
    expect(setState).not.toHaveBeenCalled();

    phaserEventEmitter.emit("levelUp", playerMonster, vi.fn<() => void>());
    await waitForSynchronizedFunctions();

    expect(setState).toHaveBeenCalledExactlyOnceWith(StateName.Finished);
  });
});
