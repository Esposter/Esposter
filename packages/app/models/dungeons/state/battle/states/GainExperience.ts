import type { Monster } from "@/models/dungeons/monster/Monster";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { calculateExperienceGain } from "@/services/dungeons/monster/calculateExperienceGain";
import { calculateLevelExperience } from "@/services/dungeons/monster/calculateLevelExperience";
import { levelUp } from "@/services/dungeons/monster/levelUp";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { phaserEventEmitter } from "@/services/phaser/events";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { usePlayerStore } from "@/store/dungeons/player";

export const GainExperience: State<StateName> = {
  name: StateName.GainExperience,
  onEnter: async (scene) => {
    const battlePlayerStore = useBattlePlayerStore();
    const { activeMonster } = storeToRefs(battlePlayerStore);
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const experienceGain = calculateExperienceGain(activeMonster.value.stats.baseExp, activeMonster.value.stats.level);
    const { experienceToNextLevel } = useExperience(activeMonster);
    const onComplete = async () => {
      await battleStateMachine.setState(StateName.Finished);
    };

    if (experienceGain - experienceToNextLevel.value >= 0) {
      // We will implement and thus assume the fact that the level up event
      // will be triggered by the experience bar once it reaches 100%
      phaserEventEmitter.once("levelUp", async ({ key, stats }, baseOnComplete) => {
        await showMessages(scene, [`${key} leveled up to ${stats.level}!`], async () => {
          baseOnComplete();
          await showMessages(scene, [`You gained ${experienceGain} exp.`], async () => {
            await gainExperienceForNonActiveMonsters(scene, experienceGain, onComplete);
          });
        });
      });
      activeMonster.value.status.exp += experienceGain;
    } else {
      activeMonster.value.status.exp += experienceGain;
      await showMessages(scene, [`You gained ${experienceGain} exp.`], async () => {
        await gainExperienceForNonActiveMonsters(scene, experienceGain, onComplete);
      });
    }
  },
};

const gainExperienceForNonActiveMonsters = async (
  scene: SceneWithPlugins,
  experienceGain: number,
  onComplete: () => Promise<void>,
) => {
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  const battlePlayerStore = useBattlePlayerStore();
  const { activeMonster } = storeToRefs(battlePlayerStore);
  const battleDialogStore = useBattleDialogStore();
  const { showMessages } = battleDialogStore;
  const leveledUpNonActiveMonsters: Monster[] = [];

  for (const nonActiveMonster of player.value.monsters.filter(({ id }) => id !== activeMonster.value.id)) {
    let levelExperience = calculateLevelExperience(nonActiveMonster.stats.level);
    nonActiveMonster.status.exp += experienceGain;
    const isLeveledUp = nonActiveMonster.status.exp - levelExperience >= 0;

    while (nonActiveMonster.status.exp - levelExperience >= 0) {
      levelUp(nonActiveMonster);
      nonActiveMonster.status.exp -= levelExperience;
      levelExperience = calculateLevelExperience(nonActiveMonster.stats.level);
    }

    if (isLeveledUp) leveledUpNonActiveMonsters.push(nonActiveMonster);
  }

  if (leveledUpNonActiveMonsters.length > 0)
    await showMessages(
      scene,
      leveledUpNonActiveMonsters.map(({ key, stats }) => `${key} leveled up to ${stats.level}!`),
      onComplete,
    );
  else await onComplete();
};
