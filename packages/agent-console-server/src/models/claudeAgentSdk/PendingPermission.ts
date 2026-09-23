import type { PermissionBehavior } from "#src/models/command/PermissionBehavior";
// A permission callback still waiting on the page. It settles exactly once — by a verdict, or by the SDK
// Abandoning the request when the turn is interrupted — and every tab's card closes on the event that follows.
export interface PendingPermission {
  settle: (behavior: PermissionBehavior, message: string) => void;
}
