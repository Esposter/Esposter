import { ActivePanel } from "@/models/dungeons/battle/menu/ActivePanel";
import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { useInfoPanelStore } from "@/store/dungeons/battle/infoPanel";
import { usePlayerStore } from "@/store/dungeons/battle/player";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";

export const PlayerInput: State<StateName> = {
  name: StateName.PlayerInput,
  onEnter: () => {
    const battleSceneStore = useBattleSceneStore();
    const { activePanel } = storeToRefs(battleSceneStore);
    const playerStore = usePlayerStore();
    const { activeMonster } = storeToRefs(playerStore);
    const infoPanelStore = useInfoPanelStore();
    const { line1Text, line2Text } = storeToRefs(infoPanelStore);

    activePanel.value = ActivePanel.Option;
    line1Text.value = "What should";
    line2Text.value = `${activeMonster.value.name} do next?`;
  },
  onExit: () => {
    const infoPanelStore = useInfoPanelStore();
    const { line1Text, line2Text } = storeToRefs(infoPanelStore);
    line1Text.value = "";
    line2Text.value = "";
  },
};
