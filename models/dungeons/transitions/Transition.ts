import { State } from "@/models/dungeons/State";

export interface Transition {
  from: State;
  to: State;
}
