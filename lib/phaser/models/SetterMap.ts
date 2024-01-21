export type SetterMap<TConfig extends object, TGameObject extends object> = {
  [P in keyof TConfig]?: (gameObject: TGameObject) => (value: any) => void;
};
