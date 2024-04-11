import { usePhaserStore } from "@/lib/phaser/store/phaser";
import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { dayjs } from "@/services/dayjs";
import { getAttack } from "@/services/dungeons/attack/getAttack";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { calculateDamage } from "@/services/dungeons/battle/calculateDamage";
import { useActionStore } from "@/store/dungeons/battle/action";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { usePlayerStore } from "@/store/dungeons/battle/player";

export const EnemyAttack: State<StateName> = {
  name: StateName.EnemyAttack,
  onEnter: () => {
    const phaserStore = usePhaserStore();
    const { scene } = storeToRefs(phaserStore);
    const battleDialogStore = useBattleDialogStore();
    const { showMessageNoInputRequired } = battleDialogStore;
    const playerStore = usePlayerStore();
    const { takeDamage } = playerStore;
    const enemyStore = useEnemyStore();
    const { activeMonster } = storeToRefs(enemyStore);
    const actionStore = useActionStore();
    const { hasEnemyAttacked } = storeToRefs(actionStore);
    const attack = getAttack(
      activeMonster.value.attackIds[Math.floor(Math.random() * activeMonster.value.attackIds.length)],
    );
    if (!attack) return;

    showMessageNoInputRequired(`Enemy ${activeMonster.value.name} used ${attack.name}.`, () =>
      scene.value.time.delayedCall(dayjs.duration(0.5, "seconds").asMilliseconds(), () => {
        useAttackAnimation(attack.id, false, () => {
          takeDamage(calculateDamage(activeMonster.value.stats.baseAttack), () => {
            hasEnemyAttacked.value = true;
            battleStateMachine.setState(StateName.EnemyPostAttackCheck);
          });
        });
      }),
    );
  },
};
