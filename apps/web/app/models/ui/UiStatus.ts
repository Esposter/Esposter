import type { UiToken } from "@/models/ui/UiToken";

// How something went, one of the four tokens that say it — spelled as their values so a store's own severity strings
// Pass straight through
export type UiStatus = `${UiToken.Error | UiToken.Info | UiToken.Success | UiToken.Warning}`;
