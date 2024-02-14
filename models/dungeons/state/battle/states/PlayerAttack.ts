import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { dayjs } from "@/services/dayjs";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { calculateDamage } from "@/services/dungeons/battle/calculateDamage";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useInfoPanelStore } from "@/store/dungeons/battle/infoPanel";
import { usePlayerStore } from "@/store/dungeons/battle/player";
import { useDialogStore } from "@/store/dungeons/dialog";

export const PlayerAttack: State<StateName> = {
  name: StateName.PlayerAttack,
  onEnter: () => {
    const phaserStore = usePhaserStore();
    const { scene } = storeToRefs(phaserStore);
    const dialogStore = useDialogStore();
    const { showMessageNoInputRequired } = dialogStore;
    const playerStore = usePlayerStore();
    const { activeMonster, attackOptionGrid } = storeToRefs(playerStore);
    const enemyStore = useEnemyStore();
    const { takeDamage } = enemyStore;
    const infoPanelStore = useInfoPanelStore();
    const { line1Text } = storeToRefs(infoPanelStore);
    const attackId = computed(() => activeMonster.value.attackIds[attackOptionGrid.value.index]);

    showMessageNoInputRequired(line1Text, `${activeMonster.value.name} used ${attackOptionGrid.value.value}.`, () =>
      scene.value.time.delayedCall(dayjs.duration(0.5, "seconds").asMilliseconds(), () =>
        useAttackAnimation(attackId.value, true, () =>
          takeDamage(calculateDamage(activeMonster.value.stats.baseAttack), () =>
            battleStateMachine.setState(StateName.PlayerPostAttackCheck),
          ),
        ),
      ),
    );
  },
};
