# Runner Navigation Chrome

This record covers four rows of SurveyJS's runner navigation: a page navigator that jumps to any page, a start page, a preview page that shows answers before submit, and a setting that shows or hides the navigation per page or per survey.

## Why deferred

The runner moves page by page with Previous and Next ([survey runner design](../../../specs/resource/survey-runner/design.md)). A jump to a page needs a rule for pages the respondent has not answered. A start page and a review step are new kinds of runner page. The document holds no navigation-visibility prop on the root or on a page (`packages/vue-survey-engine-headless/src/models/SurveyRootProps.ts`, `packages/vue-survey-engine-headless/src/models/SurveyPageNodeProps.ts`), so that setting would be a new prop too. Each needs a runner design of its own.

**Revisit when:** an owner asks for a jump to any page, a start step, or a review before submit.
