import type { DropTarget } from "@/models/pageBuilder/DropTarget";
import type { SurveyDocument } from "vue-survey-engine-headless";

import { getSurveyNodeLocation } from "@/services/resource/survey/getSurveyNodeLocation";
import { getSurveySlotLength } from "@/services/resource/survey/getSurveySlotLength";
import { getBlockNode, getBlockPropPointer } from "vue-block-editor-headless";
import { surveyNodeChildren } from "vue-survey-engine-headless";

// The places an insertion at a selection tries, in order: straight after the selected element in its own slot, then the end of each slot
// The selected element holds, so a selected page takes an element at its end. With nothing selected, the end of the first page, then the end
// Of the survey, where a page goes
export const getSurveyInsertPlaces = (document: SurveyDocument, selectedPointer: string): DropTarget[] => {
  if (selectedPointer === "") {
    const surveyPlace = { index: getSurveySlotLength(document, "/content"), slotPointer: "/content" };
    // A survey with no page has no first page whose end could take an element, so only the survey's end is left
    if (document.content.length === 0) return [surveyPlace];

    const firstPageChildrenPointer = getBlockPropPointer("/content/0", "children");
    return [
      { index: getSurveySlotLength(document, firstPageChildrenPointer), slotPointer: firstPageChildrenPointer },
      surveyPlace,
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
