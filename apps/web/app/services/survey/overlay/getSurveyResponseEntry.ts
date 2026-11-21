import type { Entry } from "#src/models/shared/overlay/Entry";

import { surveyResponseTable } from "#src/services/survey/overlay/constants";

// A save draws nothing, so its entry only reads the response's row. The read touches that row's key, which orders a save
// Behind the writes ahead of it on the same response: a submit issued while the create is in flight waits for it
export const getSurveyResponseEntry =
  (id: string): Entry =>
  (view) => {
    view.get(surveyResponseTable, [id]);
  };
