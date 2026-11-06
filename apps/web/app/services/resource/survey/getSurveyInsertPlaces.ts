import type { DropTarget } from "@/models/pageBuilder/DropTarget";
import type { SurveyDocument } from "headless-survey-engine";

import { getSurveyNodeLocation } from "@/services/resource/survey/getSurveyNodeLocation";
import { getSurveySlotLength } from "@/services/resource/survey/getSurveySlotLength";
import { getBlockNode, getBlockPropPointer } from "headless-block-editor";
import { surveyNodeChildren } from "headless-survey-engine";

// The places an insertion at a selection tries, in order: straight after the selected element in its own slot, then the end of each slot
// the selected element holds, so a selected page takes an element at its end. With nothing selected, the end of the first page, then the end
// of the survey, where a page goes
export const getSurveyInsertPlaces = (document: SurveyDocument, selectedPointer: string): DropTarget[] => {
  if (selectedPointer === "") {
    const firstPageChildrenPointer = getBlockPropPointer("/content/0", "children");
    return [
      { index: getSurveySlotLength(document, firstPageChildrenPointer), slotPointer: firstPageChildrenPointer },
      { index: getSurveySlotLength(document, "/content"), slotPointer: "/content" },
    ];
  }

  const location = getSurveyNodeLocation(selectedPointer);
  const node = getBlockNode(document, selectedPointer, surveyNodeChildren);
  if (location === undefined || node === undefined) return [];

  const ownSlotPointers = Object.keys(surveyNodeChildren(node)).map((slot) =>
    getBlockPropPointer(selectedPointer, slot),
  );
  return [
    { index: location.index + 1, slotPointer: location.slotPointer },
    ...ownSlotPointers.map((slotPointer) => ({ index: getSurveySlotLength(document, slotPointer), slotPointer })),
  ];
};
