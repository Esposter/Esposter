// The skills installer's lock file, read for the names of what it installed and nothing else
export interface SkillsLock {
  skills: Record<string, unknown>;
}
