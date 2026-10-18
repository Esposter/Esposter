import type { TrialTemplate } from "#src/models/trial/TrialTemplate";

// The template of the highest level at or below the trial's level, none when the trial sits below every template
export const findTrialTemplate = (templates: readonly TrialTemplate[], level: number): TrialTemplate | undefined =>
  templates.reduce<TrialTemplate | undefined>(
    (best, template) => (template.level <= level && (!best || template.level > best.level) ? template : best),
    undefined,
  );
