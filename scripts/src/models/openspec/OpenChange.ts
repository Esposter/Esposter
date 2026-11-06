// One open change: its id, its `tasks.md` as written (empty when it has none), and the title of every scenario its spec
// Delta holds
export interface OpenChange {
  id: string;
  scenarioTitles: string[];
  tasksText: string;
}
