# Browser suite for the resource editors

A package browser suite for the layout claims the resource editors make and happy-dom cannot show: the whiteboard canvas and its PNG export, the Note image width cap, the page builder's colour probe on a colour outside sRGB, the dashboard grid's idle handles, accent outline and unoutlined published visual, and the page builder's proofs — the canvas against its published page within one pixel, the email canvas against the compiled email, a hovered node's outline, a click's selection and a published page's own scripts under the app's policy.

## Why deferred

The app has no browser suite. A layout claim about the app's own components waits until its code is extracted into a package that has one (the `testing` skill's `references/test-environment.md`), and a screenshot suite against the app itself was rejected (the `run-app` skill). Those extractions, the whiteboard canvas, the grid tile and the page builder's canvas, are a project larger than the claims they would prove, and no workflow runs any package's browser suite today, so a suite written now would guard nothing on a push. The claims stay as the specs' prose and scenarios, and none of them is a requirement a test is owed for.

## Revisit when

A layout regression in one of these surfaces ships that a driven-browser look would have caught, or a workflow starts running the packages' `*.browser.test.ts` suites, which makes extracting an editor's drawing into a package pay for itself.

## Cheaper interim

The driven browser of the `run-app` skill, once after an edit that touches one of these surfaces, over the claim the edit could break. A claim that look does not reach is reported as unverified.
