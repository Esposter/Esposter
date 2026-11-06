import type { BlockNodeProps } from "#src/models/BlockNodeProps";
import type { SlotKeys } from "#src/models/SlotKeys";

// The props a node's type declares for itself: its props without the id and without the slots
export type OwnProps<TProps extends BlockNodeProps> = {
  [K in keyof TProps as K extends "id" | SlotKeys<TProps> ? never : K]: TProps[K];
};
