# Tasks

Build order. Sections 1 and 2 give the schema form a link renderer, section 3 gives the list a publication filter, and section 4 composes them into the invite. Section 5 is the gate on the engine's purge, and section 6 the sweep.

## 1. Link in the schema

- [x] 1.1 Test first, in the JSON-schema test: a field declared with `createResourceLinkSchema(ResourceLinkType.Survey)` carries the survey link type in its JSON schema, and a plain id field carries none.
      Verify: the test fails on the current `zodToJsonSchema`, and passes once its override reads the link registry beside the layout.

## 2. Renderer

- [x] 2.1 Move `BindingSelect.vue` to apps/web/app/components/Resource/Link/Select.vue, update the program setup's import, and keep its missing-binding message. Test first: the program setup's tests pass with only the import changed.
      Verify: no path under `Resource/Program/` names the moved select, and the missing-binding alert text is the one the program already shows.
- [ ] 2.2 Add `ResourceLink.vue` to the schema form and rank its renderer above the text renderer for link fields, so a link field is drawn with the shared select over the owner's resources of the declared type. Test first in the schema-form test: a link field renders the select and a plain text field still renders the text control.
      Verify: both cases pass, and the select's items are the type's resources, read through the type's router.

## 3. Published filter

- [x] 3.1 Test first, in the resource procedures' test: `readResources` with the publication filter returns only published resources of the type, pages over that filtered set, and reports `hasMore` over it. A list without the filter is unchanged.
      Verify: the filtered page's `hasMore` is true only when a published row exists past the limit, and the unfiltered list's test passes unedited.

## 4. The invite's picker

- [ ] 4.1 Test first: the invite's `surveyId` offers only published surveys and writes the chosen id, and the email invite's `surveyId` is drawn the same way in the email editor's content panel.
      Verify: both cases pass, and the saved id equals the id the select returned.
- [ ] 4.2 Test first: a bound survey that is no longer published shows in the warning slot with the unpublished wording and is not among the offered items. Its id is kept on the node.
      Verify: the unpublished case passes, and the node's stored `surveyId` is unchanged after the render.
- [ ] 4.3 Test first: with no published survey the select shows its empty state and writes no blank id.
      Verify: the empty-state case passes, and no save is sent.

## 5. Gate

- [ ] 5.1 Hold the release until `resource-survey-form-engine` task 6.1, the one-time purge, has run in each environment.
      Verify: the purge's log reports zero live survey rows and zero invite references in each environment before this change's release is cut.

## 6. Sweep and specs

- [ ] 6.1 Sweep the prose the change makes stale: the webpage survey invite spec's line that says no picker lists the owner's surveys, its design's Notes that call the picker owed, and the schema-forms design's Key files.
      Verify: a search for "survey picker is owed" and "no picker lists" across `openspec/` returns nothing, and the schema-forms Key files name the link renderer.
