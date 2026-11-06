import type { SurveyDropSlot } from "@/models/resource/survey/SurveyDropSlot";
import type { SurveyDocument } from "headless-survey-engine";

import { getAcceptedTypes } from "vue-block-editor-headless";
import { surveyNodeChildren, surveyRegistry } from "headless-survey-engine";

// The slots the canvas draws, each with the box its owner is drawn in and the boxes of its children in order. Read off the
// rendered DOM, where a slot is marked with its pointer and each child with a marker of its own. The types a slot accepts are
// the core's, so the canvas refuses what the core refuses
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
