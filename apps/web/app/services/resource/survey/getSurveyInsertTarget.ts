import type { DropTarget } from "@/models/pageBuilder/DropTarget";
import type { SurveyDocument, SurveyNodeType } from "headless-survey-engine";

import { getSurveyInsertPlaces } from "@/services/resource/survey/getSurveyInsertPlaces";
import { getAcceptedTypes } from "vue-block-editor-headless";
import { surveyNodeChildren, surveyRegistry } from "headless-survey-engine";

// Where an element of a kind lands for a selection: the first place along the selection whose slot the core's accepted types take the kind
// in. A kind no place takes has no target, so an insertion lands only where the core would accept it
export const getSurveyInsertTarget = (
  document: SurveyDocument,
  selectedPointer: string,
  type: SurveyNodeType,
): DropTarget | undefined =>
  getSurveyInsertPlaces(document, selectedPointer).find(({ slotPointer }) =>
    getAcceptedTypes(document, surveyRegistry, surveyNodeChildren, slotPointer).includes(type),
  );
