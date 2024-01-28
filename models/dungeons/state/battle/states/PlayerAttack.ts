import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { BattleSceneStore } from "@/models/dungeons/store/BattleSceneStore";
import { dayjs } from "@/services/dayjs";
import { calculateDamage } from "@/services/dungeons/battle/calculateDamage";

export const PlayerAttack: State<StateName> = {
  name: StateName.PlayerAttack,
  onEnter: function (this) {
    this.battleMenu.battleSubMenu.infoPanel.showMessageNoInputRequired(
      `${BattleSceneStore.activePlayerMonster.name} used ${this.battleMenu.battleSubMenu.PlayerAttackOptionCursor.activeOption}.`,
      () => {
        this.time.delayedCall(dayjs.duration(0.5, "seconds").asMilliseconds(), () => {
          BattleSceneStore.activeEnemyMonster.takeDamage(
            calculateDamage(BattleSceneStore.activePlayerMonster.baseAttack),
            () => {
              BattleSceneStore.battleStateMachine.setState(StateName.PlayerPostAttackCheck);
            },
          );
        });
      },
    );
  },
};
