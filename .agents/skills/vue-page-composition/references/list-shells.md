# Shared list-item shells and controls beside link rows

Read when two or more lists render the same item layout with different trailing actions, or when a row is itself a link with controls beside it. Rendering one list's repeated items from an array is the `SKILL.md` rule; here only the _shell_ is shared.

## The shell with an action slot

When **multiple list components** (different data sources/stores) render the same item layout but need **different trailing actions**, extract the shared shell into one list component with a named `#actions` slot. Trigger: the same `UiList` + row mapping copy-pasted across 2+ lists. The drafts and the scheduled messages share `MessageDraftsAndSentTimelineList` (`apps/web/app/components/Message/DraftsAndSent/TimelineList.vue`), and each list supplies only its buttons:

```vue
<MessageDraftsAndSentTimelineList :get-date="({ updatedAt }) => updatedAt" :get-row :items="draftItems" label="Drafts">
  <template #actions="{ item }">
    <MessageDraftsAndSentDraftSendButton :draft-item="item" />
    <MessageDraftsAndSentDraftMoreMenu :draft-item="item" />
  </template>
</MessageDraftsAndSentTimelineList>
```

## Controls beside a link row, never inside it

When the row itself is a link, its controls sit **beside** the anchor rather than inside it: `UiList` renders a row's `#actions` slot next to the row's link, and a row drawn by hand does the same, as the room list's `MessageModelRoomBaseListItem` puts its `#actions` in a sibling of its `NuxtInvisibleLink`.

A control nested inside the anchor cannot be rescued by `@click.stop`. The DOM fixes an anchor's activation target while building the event path, before any listener runs, so stopping propagation only suppresses the router's own handler — the one thing that would have called `preventDefault` — and the browser still follows the row's href, hard-loading the row's route on top of whatever the control just did. A sibling is outside the anchor's activation target altogether, so no control needs either call.

## Shell attrs passthrough

When the shell's consumers need different root interactions (one passes `@click`, another `tabindex`), do NOT add props for them — declare `defineOptions({ inheritAttrs: false })` and spread onto the actual interactive element: `<button v-bind="$attrs" type="button" ui-item>`, whose hover is the `ui-item` rule's own. A `UiList` takes the same through `getRowProps`, one object per row, as `UiDataTable` does. Render optional chrome only when the consumer supplies it: `v-if="$slots.default"` around the hover/focus action toolbar. Use VueUse `useFocusWithin(useTemplateRef(...))` for focus-visibility instead of hand-rolled focusin/focusout handlers.
