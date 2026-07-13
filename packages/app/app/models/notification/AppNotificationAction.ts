import type { Promisable } from "type-fest";

export interface AppNotificationAction {
  handler?: () => Promisable<void>;
  title: string;
  to?: string;
}
