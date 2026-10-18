# AI resource generation

"Describe your survey" → a generated SurveyJS model; same idea for dashboards and emails — an LLM-backed create path.

## Why deferred

No user-facing feature generates resource content with an LLM: the agent console runs Claude Code sessions through the Agent SDK as a developer tool. A generated create path would introduce a paid external dependency, prompt/output validation against each type's content schema, and abuse controls, as the first user-facing AI feature — a platform decision, not a create-form enhancement. The structured content models (SurveyJS JSON, visual definitions) make it _feasible_, which is exactly why it should wait for a deliberate decision rather than sneak in.

## Revisit when

A user-facing LLM feature is adopted in Esposter (the platform decision is made), or empty-resource starting friction is a validated user complaint that [blueprints](../../../specs/resource/blueprint-resource/design.md) fail to solve. When this un-defers, the blueprint manifest is the natural output unit: the model emits a schema-validated manifest and deploy is the only side-effectful step — no per-type generation paths needed.

## Cheaper interim

[Duplicate](../../../specs/resource/resource-page-parity/design.md) an existing resource, and — once [blueprints](../../../specs/resource/blueprint-resource/design.md) ship — capture-and-deploy covers the "don't start from blank" need without a model in the loop.
