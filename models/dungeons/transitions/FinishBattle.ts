import { State } from "@/models/dungeons/State";
import type { Transition } from "@/models/dungeons/transitions/Transition";

export class FinishBattle implements Transition {
  from = State.Battle;
  to = State.ShopPicker;
}
