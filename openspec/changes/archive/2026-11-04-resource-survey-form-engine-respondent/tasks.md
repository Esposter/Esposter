# Tasks

Build order. The server check and the page are independent; the swap waits on them and on the Creator.

## 1. Server

- [x] 1.1 Call `validateSurveyAnswers` on the response write path, against the published document, a draft checking present answers and a submit also the required ones. Test-first, one case per scenario in the spec delta.
      Verify: the rating and draft scenarios are router tests, and the refusal names the question.

## 2. Page

- [x] 2.1 Rewrite `useSurveyResponse` over `useSurveyRunner`: resume sets the answers and page, an answer or a page change saves a draft, and a passing `completeSurvey` submits.
      Verify: the existing `useSurveyResponse.test.ts` cases are re-expressed over the runner and pass, including the shared-device case that clears the id only on a persisted submit.
- [x] 2.2 Rewrite `View.vue` to render the runner with the closed and invite-only states and the sanitised completion message.
      Verify: a page test shows the closed message, the invite-only message and the thank-you after a persisted submit.

## 3. Swap

- [x] 3.1 Bind the content to the typed document: `SurveyResource`, the store, the router, the live-content merge, the live read, the creation default and the agent content tools, and mount the Creator in `Editor.vue`.
      Verify: no source file outside the removed SurveyJS plugins reads the old string, the router suite passes, and an old-shaped save is refused.
