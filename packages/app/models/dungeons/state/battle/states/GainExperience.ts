import type { Monster } from "@/models/dungeons/monster/Monster";
import type { State } from "@/models/dungeons/state/State";
import type { PhaserEvents } from "@/services/phaser/events";
import type { SceneWithPlugins } from "vue-phaserjs";

import { StateName } from "@/models/dungeons/state/battle/StateName";
import { calculateExperienceGain } from "@/services/dungeons/monster/calculateExperienceGain";
import { calculateLevelExperience } from "@/services/dungeons/monster/calculateLevelExperience";
import { levelUp } from "@/services/dungeons/monster/levelUp";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { phaserEventEmitter } from "@/services/phaser/events";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { usePlayerStore } from "@/store/dungeons/player";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useExperienceBarStore } from "@/store/dungeons/UI/experienceBar";
import { getSynchronizedFunction } from "@/util/getSynchronizedFunction";

export const GainExperience: State<StateName> = {
  name: StateName.GainExperience,
  onEnter: async (scene) => {
    const settingsStore = useSettingsStore();
    const { isSkipAnimations: isSettingsSkipAnimations } = storeToRefs(settingsStore);
    const battlePlayerStore = useBattlePlayerStore();
    const { activeMonster } = storeToRefs(battlePlayerStore);
    const enemyStore = useEnemyStore();
    const { activeMonster: enemyActiveMonster } = storeToRefs(enemyStore);
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const experienceBarStore = useExperienceBarStore();
    const { isSkipAnimations } = storeToRefs(experienceBarStore);
    const experienceGain = calculateExperienceGain(
      enemyActiveMonster.value.stats.baseExp,
      enemyActiveMonster.value.stats.level,
    );
    const { experienceToNextLevel } = useExperience(activeMonster);
    const onComplete = async () => {
      await showMessages(scene, [`You gained ${experienceGain} exp.`]);
      await gainExperienceForNonActiveMonsters(scene, experienceGain);
      await battleStateMachine.setState(StateName.Finished);
    };

    if (experienceGain - experienceToNextLevel.value >= 0) {
      // We will implement and thus assume the fact that the level up event
      // will be triggered by the experience bar once it reaches 100%
      const levelUpListener: PhaserEvents["levelUp"] = getSynchronizedFunction(async ({ key, stats }, onComplete) => {
        const showLevelUpMessage = async () => {
          await showMessages(scene, [`${key} leveled up to ${stats.level}!`]);
          onComplete();
          if (experienceToNextLevel.value > 0) phaserEventEmitter.emit("levelUpComplete");
        };

        if (isSkipAnimations.value || isSettingsSkipAnimations.value)
          while (experienceToNextLevel.value <= 0) levelUp(activeMonster.value);
        else levelUp(activeMonster.value);

        await showLevelUpMessage();
      });
      phaserEventEmitter.on("levelUp", levelUpListener);
      phaserEventEmitter.once(
        "levelUpComplete",
        getSynchronizedFunction(async () => {
          phaserEventEmitter.off("levelUp", levelUpListener);
          await onComplete();
        }),
      );
      activeMonster.value.status.exp += experienceGain;
      return;
    }

    activeMonster.value.status.exp += experienceGain;
    await onComplete();
  },
};

const gainExperienceForNonActiveMonsters = async (scene: SceneWithPlugins, experienceGain: number) => {
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  const battlePlayerStore = useBattlePlayerStore();
  const { activeMonster } = storeToRefs(battlePlayerStore);
  const battleDialogStore = useBattleDialogStore();
  const { showMessages } = battleDialogStore;
  const leveledUpNonActiveMonsters: Monster[] = [];

  for (const nonActiveMonster of player.value.monsters.filter(({ id }) => id !== activeMonster.value.id)) {
    nonActiveMonster.status.exp += experienceGain;
    let levelExperience = calculateLevelExperience(nonActiveMonster.stats.level);
    const isLeveledUp = nonActiveMonster.status.exp - levelExperience >= 0;

    while (nonActiveMonster.status.exp - levelExperience >= 0) {
      levelUp(nonActiveMonster);
      levelExperience = calculateLevelExperience(nonActiveMonster.stats.level);
    }

    if (isLeveledUp) leveledUpNonActiveMonsters.push(nonActiveMonster);
  }

  if (leveledUpNonActiveMonsters.length > 0)
    await showMessages(
      scene,
      leveledUpNonActiveMonsters.map(({ key, stats }) => `${key} leveled up to ${stats.level}!`),
    );
};
