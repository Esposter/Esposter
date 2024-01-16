import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/StateName";

export class StateMachine<TContext extends object> {
  context: TContext;
  states: Map<StateName, State> = new Map();
  currentState: State = { name: StateName.None };
  isChangingState = false;
  changingStateNameQueue: StateName[] = [];

  constructor(context: TContext) {
    this.context = context;
  }

  get currentStateName() {
    return this.currentState.name;
  }

  update() {
    const stateName = this.changingStateNameQueue.shift();
    if (!stateName) return;

    this.setState(stateName);
  }

  setState(stateName: StateName) {
    const state = this.states.get(stateName);
    if (!state || stateName === this.currentStateName) return;

    if (this.isChangingState) {
      this.changingStateNameQueue.push(stateName);
      return;
    }

    this.isChangingState = true;
    this.currentState = state;
    this.currentState.onEnter?.();
    this.isChangingState = false;
  }

  addState(state: State) {
    this.states.set(state.name, {
      name: state.name,
      onEnter: state.onEnter?.bind(this.context),
    });
  }
}
