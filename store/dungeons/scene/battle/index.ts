import { AttackId } from "@/models/dungeons/attack/AttackId";
import { ActivePanel } from "@/models/dungeons/battle/UI/menu/ActivePanel";
import { type Monster } from "@/models/dungeons/battle/monsters/Monster";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { StateMachine } from "@/models/dungeons/state/StateMachine";
import { StateMap } from "@/models/dungeons/state/battle/StateMap";
import { type StateName } from "@/models/dungeons/state/battle/StateName";

export const useBattleSceneStore = defineStore("dungeons/scene/battle", () => {
  const activePanel = ref(ActivePanel.Option);
  const activeEnemyMonster = ref<Monster>({
    name: TextureManagerKey.Carnodusk,
    asset: {
      key: TextureManagerKey.Carnodusk,
    },
    stats: {
      maxHp: 25,
      baseAttack: 5,
    },
    currentLevel: 5,
    currentHp: 25,
    attackIds: [AttackId.IceShard],
  });
  const battleStateMachine = new StateMachine<StateName>(StateMap);
  const isWaitingForPlayerSpecialInput = ref(false);
  return { activePanel, activeEnemyMonster, battleStateMachine, isWaitingForPlayerSpecialInput };
});
