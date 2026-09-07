import type { Promisable } from "type-fest";

export interface AppNotificationAction {
  handler?: () => Promisable<void>;
  // Single-use: spent once it succeeds (undo-style mutations) — a second fire would target state the first
  // Fire already changed, so surfaces strip it via consumeNotificationAction. Repeatable actions
  // (navigation links, copy link) omit it and stay clickable from the bell panel
  isSingleUse?: true;
  title: string;
  to?: string;
}
