# Webpage survey picker

Gap 7 of the [gap survey](../archive/2026-10-25-gap-survey-2026-10-25/proposal.md).

## Why

A webpage's survey invite takes a bare survey id. The owner must copy an id from somewhere else and paste it into the node. Every other reference in the editor is a picker: a dashboard visual chooses its dataset from a list, and a program names its survey from the owner's surveys. The invite is the one place an owner types an identifier by hand.

The [webpage survey invite spec](../../specs/resource/webpage-survey-invite-blocks/design.md) names this as owed and not built. The resource roadmap does not list it.

## What Changes

- The invite's survey field gets a picker that lists the owner's published surveys, by title. Choosing one writes its id, as the field does now. The picker is the program setup's existing binding select, moved out of the program folder and given a publication filter, so the program and the invite draw one component.
- The picker is a renderer for any field that names another resource, read from the resource-link declaration the field already carries, so the invite is the first user of a general mechanism and not a special case.
- A survey bound to an invite that is no longer published stays bound and is shown flagged. The picker does not offer it.
- The same picker serves the email editor's survey invite, since the email node reuses the webpage node's props.

## Recommendation

Build the picker as a schema-form renderer keyed on the resource-link declaration, and list published surveys through the resource list the explorer already reads.

- The program setup already binds its survey through a select over the owner's surveys, so a second survey picker would be a copy. A component that knows the invite's field by name would also need a second one for each other link field, and the repo already has more than one such field. A renderer keyed on the declaration covers every link field the schema forms draw, so the next picker is written once.

**Against the survey form engine.** The picker is written against the [survey form engine](../resource-survey-form-engine-program/design.md)'s model, not against SurveyJS, which that change removes. The picker reads only a survey resource's identity, title and publication, and those belong to the resource layer the engine keeps. It never reads a survey's questions, so the engine's typed document and the picker do not depend on each other beyond that.

**Ordering.** The engine's one-time purge deletes every stored survey and removes each invite that names one. If the picker shipped first, an owner could bind a survey the purge then deletes. So the picker waits for the purge to run in each environment.

## Capabilities

- **resource/webpage-survey-invite-blocks** (modified): the invite's survey is chosen from a picker of published surveys.
- **architecture/schema-forms** (modified): a field that names another resource is drawn as a picker of that resource's type.

## Impact

- The invite and the email button keep their stored shape. A bound id is unchanged, so no page needs rewriting.
- Every schema form that draws a resource-link field gains the picker. Those fields today are the invite's `surveyId`, the program's `emailId` and `surveyId`, and the dataset reference's `id`, so each one a schema form draws switches from a text field to the picker; the change does not add a link field anywhere.
- The explorer's list read gains a publication filter, used only by the picker.
