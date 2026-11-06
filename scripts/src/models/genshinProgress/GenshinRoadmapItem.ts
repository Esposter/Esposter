// A roadmap item under a phase heading, ticked when done, the phase it sits under, absent when none does, and the quest
// It names as `quest <id>`, absent when it names none
export interface GenshinRoadmapItem {
  isDone: boolean;
  phase?: number;
  quest?: string;
}
