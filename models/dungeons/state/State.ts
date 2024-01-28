export interface State<TStateName extends string | null> {
  name: TStateName;
  onEnter?: () => void;
}
