import { ActivePanel } from "@/models/dungeons/battle/UI/menu/ActivePanel";
import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { useBattleSceneStore } from "@/store/dungeons/scene/battle";

export const PlayerInput: State<StateName> = {
  name: StateName.PlayerInput,
  onEnter: () => {
    const battleSceneStore = useBattleSceneStore();
    const { activePanel } = storeToRefs(battleSceneStore);
    activePanel.value = ActivePanel.Option;
  },
};
