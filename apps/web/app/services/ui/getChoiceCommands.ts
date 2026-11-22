import type { ChoiceCommandOptions } from "#src/models/ui/ChoiceCommandOptions";
import type { UiCommand } from "#src/models/ui/UiCommand";

import { ID_SEPARATOR } from "@esposter/shared";

// A choice among values, each listed with the chosen one marked. Choosing one sets it, and its id joins the group and the value
export const getChoiceCommands = <T extends string>({
  getMeaning,
  getTitle,
  group,
  selectedValue,
  setValue,
  values,
}: ChoiceCommandOptions<T>): UiCommand[] =>
  values.map((value) => ({
    group,
    id: `${group}${ID_SEPARATOR}${value}`,
    isSelected: value === selectedValue,
    meaning: getMeaning(value),
    run: () => {
      setValue(value);
    },
    title: getTitle(value),
  }));
