import { State } from "@/models/dungeons/State";
import type { Transition } from "@/models/dungeons/transitions/Transition";

export class StartGame implements Transition {
  from = State.Start;
  to = State.Battle;
}
