import { type State } from "@/models/dungeons/state/State";

export class StateMachine<TContext extends object, TStateName extends string> {
  context: TContext;
  stateMap: Map<TStateName, State<TContext, TStateName>>;
  currentState: State<TContext, TStateName | null> = { name: null };
  isChangingState = false;
  changingStateNameQueue: TStateName[] = [];

  constructor(context: TContext, stateMap: Map<TStateName, State<TContext, TStateName>>, initialStateName: TStateName) {
    this.context = context;
    this.stateMap = stateMap;
    this.setState(initialStateName);
  }

  get currentStateName() {
    return this.currentState.name;
  }

  update() {
    const stateName = this.changingStateNameQueue.shift();
    if (!stateName) return;

    this.setState(stateName);
  }

  setState(stateName: TStateName) {
    const state = this.stateMap.get(stateName);
    console.log(stateName);
    if (!state || stateName === this.currentStateName) return;

    if (this.isChangingState) {
      this.changingStateNameQueue.push(stateName);
      return;
    }

    this.isChangingState = true;
    this.currentState = state;
    this.currentState.onEnter?.call(this.context);
    this.isChangingState = false;
  }

  addState(state: State<TContext, TStateName>) {
    this.stateMap.set(state.name, state);
  }
}
