import type { ResumeItem } from "#src/models/resume/ResumeItem";

// One check's reading: its leftovers, or the error that kept the check from running
export interface ResumeRow {
  error: string;
  items: ResumeItem[];
  name: string;
}
