import type { UiCommand } from "@/models/ui/UiCommand";
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";

// Every key the console lists is marked by what it does, so a listed copy keeps its meaning
export type AgentConsoleCommand = Extract<UiCommand, { meaning: UiIconMeaning }>;
