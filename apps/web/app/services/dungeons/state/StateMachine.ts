import type { State } from "@/models/dungeons/state/State";
import type { StateMachineStateMap } from "@/models/dungeons/state/StateMachineStateMap";
import type { SceneWithPlugins } from "vue-phaserjs";

export class StateMachine<TStateName extends string> {
  currentState: State<TStateName | undefined> = { name: undefined };
  // Both wired by the scene that runs the machine as it starts: the states reach the machine to move it on, so a
  // Machine that imported its own states would close a module cycle through every one of them
  declare scene: SceneWithPlugins;
  declare stateMap: StateMachineStateMap<TStateName>;

  async setState(stateName?: TStateName) {
    if (stateName === this.currentState.name) return;

    const state = stateName === undefined ? { name: undefined } : this.stateMap[stateName];
    await this.currentState.onExit?.(this.scene);
    this.currentState = state;
    await this.currentState.onEnter?.(this.scene);
  }
}
