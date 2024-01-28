import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { BattleSceneStore } from "@/models/dungeons/store/BattleSceneStore";
import { dayjs } from "@/services/dayjs";
import { calculateDamage } from "@/services/dungeons/battle/calculateDamage";

export const EnemyAttack: State<StateName> = {
  name: StateName.EnemyAttack,
  onEnter: function (this) {
    this.battleMenu.battleSubMenu.infoPanel.showMessageNoInputRequired(
      `Enemy ${BattleSceneStore.activeEnemyMonster.name} used ${BattleSceneStore.activeEnemyMonster.attacks[0].name}.`,
      () => {
        this.time.delayedCall(dayjs.duration(0.5, "seconds").asMilliseconds(), () => {
          BattleSceneStore.activePlayerMonster.takeDamage(
            calculateDamage(BattleSceneStore.activeEnemyMonster.baseAttack),
            () => {
              BattleSceneStore.battleStateMachine.setState(StateName.EnemyPostAttackCheck);
            },
          );
        });
      },
    );
  },
};
