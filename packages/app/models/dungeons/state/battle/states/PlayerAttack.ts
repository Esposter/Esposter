import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { dayjs } from "@/services/dayjs";
import { calculateDamage } from "@/services/dungeons/monster/calculateDamage";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";

export const PlayerAttack: State<StateName> = {
  name: StateName.PlayerAttack,
  onEnter: async (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessageNoInputRequired } = battleDialogStore;
    const battlePlayerStore = useBattlePlayerStore();
    const { activeMonster, attackOptionGrid } = storeToRefs(battlePlayerStore);
    const enemyStore = useEnemyStore();
    const { takeDamage } = enemyStore;
    // We won't use computed here because we've locked in our attack now
    const attack = attackOptionGrid.value.value;
    if (!attack) return;

    await showMessageNoInputRequired(scene, `${activeMonster.value.key} used ${attack.id}.`, () => {
      scene.time.delayedCall(dayjs.duration(0.5, "seconds").asMilliseconds(), async () => {
        await useAttackAnimation(scene, attack, true, () => {
          takeDamage(calculateDamage(activeMonster.value.stats.attack), async () => {
            await battleStateMachine.setState(StateName.PlayerPostAttackCheck);
          });
        });
      });
    });
  },
};
