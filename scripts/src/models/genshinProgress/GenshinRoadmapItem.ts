// A roadmap item under a phase heading, ticked when done, and the phase it sits under, absent when none does
export interface GenshinRoadmapItem {
  isDone: boolean;
  phase?: number;
}
