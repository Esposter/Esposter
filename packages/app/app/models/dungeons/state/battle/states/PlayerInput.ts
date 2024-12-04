import type { State } from "@/models/dungeons/state/State";

import { ActivePanel } from "@/models/dungeons/scene/battle/menu/ActivePanel";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { useInfoPanelStore } from "@/store/dungeons/battle/infoPanel";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";
import { prettify } from "@/util/text/prettify";

export const PlayerInput: State<StateName> = {
  name: StateName.PlayerInput,
  onEnter: () => {
    const battleSceneStore = useBattleSceneStore();
    const { activePanel } = storeToRefs(battleSceneStore);
    const battlePlayerStore = useBattlePlayerStore();
    const { activeMonster } = storeToRefs(battlePlayerStore);
    const infoPanelStore = useInfoPanelStore();
    const { line1DialogMessage, line2Text } = storeToRefs(infoPanelStore);

    activePanel.value = ActivePanel.Option;
    line1DialogMessage.value.text = "What should";
    line2Text.value = `${prettify(activeMonster.value.key)} do next?`;
  },
  onExit: () => {
    const infoPanelStore = useInfoPanelStore();
    const { line1DialogMessage, line2Text } = storeToRefs(infoPanelStore);

    line1DialogMessage.value.text = "";
    line2Text.value = "";
  },
};
