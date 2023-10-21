import { State } from "@/models/dungeons/State";

export interface TransitionAction {
  from: State;
  to: State;
}
