import type { SurveyElementView } from "#src/models/SurveyElementView";

// Every view in a tree in document order, a panel's view before the views it holds
export const flattenSurveyElementViews = (views: SurveyElementView[]): SurveyElementView[] =>
  views.flatMap((view) => [view, ...flattenSurveyElementViews(view.children)]);
