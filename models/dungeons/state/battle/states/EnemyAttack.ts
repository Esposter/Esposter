import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { dayjs } from "@/services/dayjs";
import { getAttackName } from "@/services/dungeons/battle/attack/getAttackName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { calculateDamage } from "@/services/dungeons/battle/calculateDamage";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useInfoPanelStore } from "@/store/dungeons/battle/infoPanel";
import { usePlayerStore } from "@/store/dungeons/battle/player";
import { useDialogStore } from "@/store/dungeons/dialog";

export const EnemyAttack: State<StateName> = {
  name: StateName.EnemyAttack,
  onEnter: () => {
    const phaserStore = usePhaserStore();
    const { scene } = storeToRefs(phaserStore);
    const dialogStore = useDialogStore();
    const { showMessageNoInputRequired } = dialogStore;
    const playerStore = usePlayerStore();
    const { takeDamage } = playerStore;
    const enemyStore = useEnemyStore();
    const { activeMonster } = storeToRefs(enemyStore);
    const infoPanelStore = useInfoPanelStore();
    const { line1Text } = storeToRefs(infoPanelStore);
    const attackId = computed(() => activeMonster.value.attackIds[0]);

    showMessageNoInputRequired(
      line1Text,
      `Enemy ${activeMonster.value.name} used ${getAttackName(attackId.value)}.`,
      () =>
        scene.value.time.delayedCall(dayjs.duration(0.5, "seconds").asMilliseconds(), () =>
          useAttackAnimation(attackId.value, false, () =>
            takeDamage(calculateDamage(activeMonster.value.stats.baseAttack), () =>
              battleStateMachine.setState(StateName.EnemyPostAttackCheck),
            ),
          ),
        ),
    );
  },
};
