import type { TransitionAction } from "@/models/dungeons/Actions/TransitionAction";
import { State } from "@/models/dungeons/State";

export class BattleAction implements TransitionAction {
  from = State.Battle;
  to = State.Battle;
}
