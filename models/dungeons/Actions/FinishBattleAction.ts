import type { TransitionAction } from "@/models/dungeons/Actions/TransitionAction";
import { State } from "@/models/dungeons/State";

export class FinishBattleAction implements TransitionAction {
  from = State.Battle;
  to = State.ShopPicker;
}
