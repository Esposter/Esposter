import { type StateName } from "@/models/dungeons/state/StateName";

export interface State {
  name: StateName;
  onEnter?: () => void;
}
