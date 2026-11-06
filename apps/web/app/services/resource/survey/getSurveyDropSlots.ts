import type { SurveyDropSlot } from "@/models/resource/survey/SurveyDropSlot";
import type { SurveyDocument } from "vue-survey-engine-headless";

import { getAcceptedTypes } from "vue-block-editor-headless";
import { surveyNodeChildren, surveyRegistry } from "vue-survey-engine-headless";

// The slots the canvas draws, each with the box its owner is drawn in and the boxes of its children in order. Read off the
// Rendered DOM, where a slot is marked with its pointer and each child with a marker of its own. The types a slot accepts are
// The core's, so the canvas refuses what the core refuses
export const getSurveyDropSlots = (canvas: HTMLElement | undefined, document: SurveyDocument): SurveyDropSlot[] =>
  Array.from(canvas?.querySelectorAll<HTMLElement>("[data-survey-slot]") ?? [], (element) => {
    const slotPointer = element.dataset.surveySlot ?? "";
    return {
      acceptedTypes: getAcceptedTypes(document, surveyRegistry, surveyNodeChildren, slotPointer),
      box: element.getBoundingClientRect(),
      childBoxes: Array.from(element.querySelectorAll<HTMLElement>(":scope > [data-survey-child]"), (child) =>
        child.getBoundingClientRect(),
      ),
      slotPointer,
    };
  });
