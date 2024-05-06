import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { State } from "@/models/dungeons/state/State";

export class StateMachine<TStateName extends string> {
  scene!: SceneWithPlugins;
  stateMap: Record<TStateName, State<TStateName>>;
  currentState: State<TStateName | null> = { name: null };
  isChangingState = false;
  changingStateNameQueue: (TStateName | null)[] = [];

  constructor(stateMap: Record<TStateName, State<TStateName>>) {
    this.stateMap = stateMap;
  }

  get currentStateName() {
    return this.currentState.name;
  }

  update() {
    const stateName = this.changingStateNameQueue.shift();
    if (!stateName) return;

    this.setState(stateName);
  }

  setState(stateName: TStateName | null) {
    if (stateName === this.currentStateName) return;

    const state = stateName === null ? { name: null } : this.stateMap[stateName];
    if (!state) return;

    if (this.isChangingState) {
      this.changingStateNameQueue.push(stateName);
      return;
    }

    this.isChangingState = true;
    this.currentState.onExit?.(this.scene);
    this.currentState = state;
    this.currentState.onEnter?.(this.scene);
    this.isChangingState = false;
  }
}
