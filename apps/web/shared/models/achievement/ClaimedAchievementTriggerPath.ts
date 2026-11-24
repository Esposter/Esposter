import type { TRPCPath } from "#shared/models/trpc/TRPCProcedureInputs";

// The triggers whose input is a client's own save of a client-authoritative game. The server stores the save as sent
// And cannot tell whether play could have produced it, so an unlock read from it is a claim, and its definition's
// Points are typed `0` rather than left to review
export type ClaimedAchievementTriggerPath = Extract<TRPCPath, "clicker.saveClicker" | "dungeons.saveDungeons">;
