import type { ComponentInternalInstance, EffectScope } from "vue";

export interface OnlineSubscribableContext {
  instance?: ComponentInternalInstance | null;
  scope?: EffectScope | null;
}
