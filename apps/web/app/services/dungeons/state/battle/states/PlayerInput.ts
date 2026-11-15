import type { State } from "#src/models/dungeons/state/State";

import { ActivePanel } from "#src/models/dungeons/scene/battle/menu/ActivePanel";
import { StateName } from "#src/models/dungeons/state/battle/StateName";
import { useBattleInfoPanelStore } from "#src/store/dungeons/battle/infoPanel";
import { useBattlePlayerStore } from "#src/store/dungeons/battle/player";
import { useBattleSceneStore } from "#src/store/dungeons/battle/scene";
import { prettify } from "#src/util/text/prettify";

export const PlayerInput: State<typeof StateName.PlayerInput> = {
  name: StateName.PlayerInput,
  onEnter: () => {
    const battleSceneStore = useBattleSceneStore();
    const { activePanel } = storeToRefs(battleSceneStore);
    const battlePlayerStore = useBattlePlayerStore();
    const { activeMonster } = storeToRefs(battlePlayerStore);
    const battleInfoPanelStore = useBattleInfoPanelStore();
    const { line1DialogMessage, line2Text } = storeToRefs(battleInfoPanelStore);

    activePanel.value = ActivePanel.Option;
    line1DialogMessage.value.text = "What should";
    line2Text.value = `${prettify(activeMonster.value.key)} do next?`;
  },
  onExit: () => {
    const battleInfoPanelStore = useBattleInfoPanelStore();
    const { line1DialogMessage, line2Text } = storeToRefs(battleInfoPanelStore);

    line1DialogMessage.value.text = "";
    line2Text.value = "";
  },
};
