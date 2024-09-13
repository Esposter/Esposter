import type { State } from "@/models/dungeons/state/State";
import type { SceneWithPlugins } from "vue-phaserjs";

export class StateMachine<TStateName extends string> {
  currentState: State<null | TStateName> = { name: null };
  scene!: SceneWithPlugins;
  stateMap: Record<TStateName, State<TStateName>>;

  constructor(stateMap: Record<TStateName, State<TStateName>>) {
    this.stateMap = stateMap;
  }

  async setState(stateName: null | TStateName) {
    if (stateName === this.currentState.name) return;

    const state = stateName === null ? { name: null } : this.stateMap[stateName];
    await this.currentState.onExit?.(this.scene);
    this.currentState = state;
    await this.currentState.onEnter?.(this.scene);
  }
}
