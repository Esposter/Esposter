import { usePhaserStore } from "@/lib/phaser/store/phaser";
import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { dayjs } from "@/services/dayjs";
import { getAttack } from "@/services/dungeons/attack/getAttack";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { calculateDamage } from "@/services/dungeons/scene/battle/calculateDamage";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { pickRandomValue } from "@/util/math/random/pickRandomValue";

export const EnemyAttack: State<StateName> = {
  name: StateName.EnemyAttack,
  onEnter: () => {
    const phaserStore = usePhaserStore();
    const { scene } = storeToRefs(phaserStore);
    const battleDialogStore = useBattleDialogStore();
    const { showMessageNoInputRequired } = battleDialogStore;
    const battlePlayerStore = useBattlePlayerStore();
    const { takeDamage } = battlePlayerStore;
    const enemyStore = useEnemyStore();
    const { activeMonster } = storeToRefs(enemyStore);
    const randomAttackId = pickRandomValue(activeMonster.value.attackIds);
    const randomAttack = getAttack(randomAttackId);

    showMessageNoInputRequired(`Enemy ${activeMonster.value.name} used ${randomAttack.name}.`, () =>
      scene.value.time.delayedCall(dayjs.duration(0.5, "seconds").asMilliseconds(), () => {
        useAttackAnimation(randomAttack, false, () => {
          takeDamage(calculateDamage(activeMonster.value.stats.baseAttack), () => {
            battleStateMachine.setState(StateName.EnemyPostAttackCheck);
          });
        });
      }),
    );
  },
};
