import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { calculateExperienceGain } from "@/services/dungeons/scene/battle/calculateExperienceGain";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { usePlayerStore } from "@/store/dungeons/player";

export const GainExperience: State<StateName> = {
  name: StateName.GainExperience,
  onEnter: async (scene) => {
    const playerStore = usePlayerStore();
    const { player } = storeToRefs(playerStore);
    const enemyStore = useEnemyStore();
    const { activeMonster } = storeToRefs(enemyStore);
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const experienceGain = calculateExperienceGain(activeMonster.value.stats.baseExp, activeMonster.value.status.level);

    await showMessages(scene, [`You gained ${experienceGain} exp.`], async () => {
      for (const monster of player.value.monsters) monster.status.exp += experienceGain;
      await battleStateMachine.setState(StateName.Finished);
    });
  },
};
