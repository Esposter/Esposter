import { type State } from "@/models/dungeons/state/State";

export class StateMachine<TStateName extends string> {
  stateMap: Map<TStateName, State<TStateName>>;
  currentState: State<TStateName | null> = { name: null };
  isChangingState = false;
  changingStateNameQueue: (TStateName | null)[] = [];

  constructor(stateMap: Map<TStateName, State<TStateName>>) {
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

    const state = stateName === null ? { name: null } : this.stateMap.get(stateName);
    if (!state) return;

    if (this.isChangingState) {
      this.changingStateNameQueue.push(stateName);
      return;
    }

    this.isChangingState = true;
    this.currentState.onExit?.();
    this.currentState = state;
    this.currentState.onEnter?.();
    this.isChangingState = false;
  }
}
