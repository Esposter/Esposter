import type { UiToken } from "@/models/ui/UiToken";

// How something went, one of the four tokens that say it. A token is its value, so a store's own severity strings pass
// Straight through
export type UiStatus = typeof UiToken.Error | typeof UiToken.Info | typeof UiToken.Success | typeof UiToken.Warning;
