import { State } from "@/models/dungeons/State";
import type { Transition } from "@/models/dungeons/transitions/Transition";

export class LoadGame implements Transition {
  from = State.Start;
  to = State.Load;
}
