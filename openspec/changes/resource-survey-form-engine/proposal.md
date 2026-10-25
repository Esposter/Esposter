# Survey Form Engine

## Why

A survey's questions are SurveyJS's JSON, stored as one string in the survey's content. The server checks only that the string parses to a JSON object, so an agent or an owner can save a survey with a question type SurveyJS does not know or two questions sharing a name, and the failure surfaces later, in the runner or in the responses. The AI-native resources program names this as a document held inside a string.

The same question raises a larger one: the survey stack is SurveyJS, whose Creator is commercially licensed. The Creator is free to use only under the open-source exception recorded in [the rejected licence proposal](../../rejected/resource/survey-creator-licence/design.md), and the planned [paid storage tiers](../resource-paid-storage-tiers/design.md) would end that exception. So the choice between keeping SurveyJS, replacing it with our own survey model, or adopting an open-source form library has to be made before paid tiers ship.

## What Changes

Keep SurveyJS as the engine of the Creator and the runner, and make the document it stores checked on every write.

- The survey's model is checked against a Zod schema of the parts the server reads: its pages and their elements, each element's name and type, nested panels, and unique question names across the survey. Everything else in the JSON stays SurveyJS's, passed through unchanged.
- The same check runs wherever a survey is saved, whether by the owner's editor or by an agent's content tool, so both refuse the same invalid survey with the same reason.
- The server's dataset reader takes its element type from the same schema in place of the loose type it holds today.
- Stored surveys are not converted. The model stays a string in storage, so no backfill of working copies or retained version objects is needed. A read-only scan of every stored survey runs first, so the new check is written to accept every survey that exists today.
- The licence question is recorded as a roadmap item that must be decided before paid tiers ship: buy a Creator licence, or build the Creator our own way on the [deferred survey editor core](../../deferred/resource/survey-on-editor-core/design.md).

The comparison behind this choice, with each option's licence, weight, question types, responses, agent access and migration cost, is in `design.md`.

## Capabilities

- **resource/survey-resource** (modified): a survey's questions must have unique names and known types for a save to succeed.

## Waiting on

- The read-only scan of stored surveys (task 1) decides the check's exact rules. Nothing else in this change is built before its counts are in.
