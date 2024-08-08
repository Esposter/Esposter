import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { State } from "@/models/dungeons/state/State";

export class StateMachine<TStateName extends string> {
  changingStateNameQueue: (null | TStateName)[] = [];
  currentState: State<null | TStateName> = { name: null };
  isChangingState = false;
  scene!: SceneWithPlugins;
  stateMap: Record<TStateName, State<TStateName>>;

  constructor(stateMap: Record<TStateName, State<TStateName>>) {
    this.stateMap = stateMap;
  }

  async setState(stateName: null | TStateName) {
    if (stateName === this.currentStateName) return;

    const state = stateName === null ? { name: null } : this.stateMap[stateName];
    if (!state) return;

    if (this.isChangingState) {
      this.changingStateNameQueue.push(stateName);
      return;
    }

    this.isChangingState = true;
    await this.currentState.onExit?.(this.scene);
    this.currentState = state;
    await this.currentState.onEnter?.(this.scene);
    this.isChangingState = false;
  }

  update() {
    const stateName = this.changingStateNameQueue.shift();
    if (!stateName) return;

    this.setState(stateName);
  }

  get currentStateName() {
    return this.currentState.name;
  }
}
