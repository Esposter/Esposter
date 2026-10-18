# Component Wrapper Absorption

## Why

The app mounts several engines through a Vue component someone else maintains: the chart engine, the code editor, the PDF renderer twice over, the dashboard grid, four Vue Flow plugins and the form engine's bindings. Each wrapper holds the engine one release behind its own, adds a second way to reach what the engine already offers, and brings what it needed for its own users into our bundle. The PDF pair is the extreme case: one inlines the renderer's worker into its entry, and the other is a closed-source viewer pinned a renderer major behind, running unlicensed in evaluation mode, with a headless UI library and a crypto package of its own.

## What Changes

Every wrapper is replaced by a component of the app's own over the engine it wrapped, and the engine stays.

- A chart, a code view, a PDF thumbnail and viewer, the dashboard grid, the flowchart's background, controls, minimap and resizer, and the schema form's bindings each become an app component.
- Each wrapper's dependency, its config entries and the workarounds it forced are removed in the commit that removes its last import.
- A replacement keeps every behaviour an upstream fix put in the wrapper, and fixes the wrapper's open defects it can reach.
- **BREAKING:** none for a reader. The PDF dialog loses the evaluation watermark it shows today.

## Capabilities

The parts own every capability, so the program carries no spec delta.

## Waiting on

None.

## Impact

- The chart, code, PDF, dashboard grid, flowchart and schema form components and their tests.
- The dependency catalog, the lockfile, the `overrides` entry for the PDF renderer, the build's transpile entry, and the security config's PDF allowances.
- The dependency admission standard, which gains the rule that a component wrapper is absorbed as an app component, and loses the rejected PDF consolidation it cites.
