import type { SetupContext } from "vue";

export type SetterMap<
  TConfiguration extends object,
  TGameObject extends object,
  TEmitsOptions extends Record<string, any[]>,
> = {
  [P in keyof TConfiguration]?: (
    gameObject: TGameObject,
    emit: SetupContext<TEmitsOptions>["emit"],
  ) => (value?: TConfiguration[P]) => void;
};
