export interface State<TContext extends object, TStateName extends string | null> {
  name: TStateName;
  onEnter?: (this: TContext) => void;
}
