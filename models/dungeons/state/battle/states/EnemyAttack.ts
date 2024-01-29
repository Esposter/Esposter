import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { dayjs } from "@/services/dayjs";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { calculateDamage } from "@/services/dungeons/battle/calculateDamage";
import { getAttackName } from "@/services/dungeons/battle/getAttackName";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useInfoPanelStore } from "@/store/dungeons/battle/infoPanel";
import { usePlayerStore } from "@/store/dungeons/battle/player";

export const EnemyAttack: State<StateName> = {
  name: StateName.EnemyAttack,
  onEnter: () => {
    const phaserStore = usePhaserStore();
    const { scene } = storeToRefs(phaserStore);
    const playerStore = usePlayerStore();
    const { takeDamage } = playerStore;
    const enemyStore = useEnemyStore();
    const { activeMonster } = storeToRefs(enemyStore);
    const infoPanelStore = useInfoPanelStore();
    const { showMessageNoInputRequired } = infoPanelStore;

    showMessageNoInputRequired(
      `Enemy ${activeMonster.value.name} used ${getAttackName(activeMonster.value.attackIds[0])}.`,
      () => {
        scene.value.time.delayedCall(dayjs.duration(0.5, "seconds").asMilliseconds(), () => {
          takeDamage(calculateDamage(activeMonster.value.stats.baseAttack), () =>
            battleStateMachine.setState(StateName.EnemyPostAttackCheck),
          );
        });
      },
    );
  },
};
