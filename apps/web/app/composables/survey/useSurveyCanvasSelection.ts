// @unocss-include

import { useSurveyCreatorStore } from "@/store/survey/creator";

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
      select(pointer);
    },
    onKeydown: (event: KeyboardEvent) => {
      if (event.key === "Enter" && event.target === event.currentTarget) select(pointer);
    },
  });

  return { getSelectionBindings };
};
