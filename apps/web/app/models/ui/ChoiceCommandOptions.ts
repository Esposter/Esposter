import type { UiIconMeaning } from "#src/models/ui/UiIconMeaning";

export interface ChoiceCommandOptions<T extends string> {
  getMeaning: (value: T) => UiIconMeaning;
  getTitle: (value: T) => string;
  group: string;
  selectedValue: T;
  setValue: (value: T) => void;
  values: readonly T[];
}
