// @unocss-include

import { useSurveyCreatorStore } from "#src/store/survey/creator";
import { checkIsNestedInteraction } from "@esposter/shared";

// The selection a canvas element takes: drawn as chosen while its pointer is the selected one, and chosen by a click on
// Itself or by Enter while it holds focus. A click from a node inside it is stopped there, and an Enter from inside it is
// Not its own, so a nested node chooses only itself
export const useSurveyCanvasSelection = () => {
  const surveyCreatorStore = useSurveyCreatorStore();
  const { selectedPointer } = storeToRefs(surveyCreatorStore);
  const { select } = useSurveyCreatorCommands();
  const getSelectionBindings = (pointer: string) => ({
    class: { "ui-selected": selectedPointer.value === pointer },
    onClick: (event: MouseEvent) => {
      event.stopPropagation();
      // A control inside the element does its own act, so a click on it does not choose the element
      if (!checkIsNestedInteraction(event)) select(pointer);
    },
    onKeydown: (event: KeyboardEvent) => {
      if (event.key === "Enter" && event.target === event.currentTarget) select(pointer);
    },
  });

  return { getSelectionBindings };
};
