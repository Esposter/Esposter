import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";

export const Intro: State<StateName> = {
  name: StateName.Intro,
  onEnter: () => {
    useRectangleCameraMask(() => {
      battleStateMachine.setState(StateName.PreBattleInfo);
    });
  },
};
