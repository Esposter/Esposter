# Structured containers

Read when writing or changing a component that frames other content — a dialog, popover, drawer, card, panel, sheet or editor region — or when a call site of one writes its own padding, scroll wrapper or footer inside the container's slot. `references/slots.md` is how a slot is declared and forwarded; this page is what a container's slots are _for_.

> **Status:** the dialog's body and footer regions, the `#footer` slot, the shared region shortcut and the scan test that fails a call site drawing its own region are built. The overflow itself is judged in a driven browser, since no test measures layout.

## A container owns its regions, and a slot carries content

A container draws regions — a header, a body, a footer — and the invariants that make them work: which region scrolls, the padding, what stays pinned when the content is taller than the frame, the gap between regions, the focus and the close. Those invariants live in the container, once. A call site fills the regions with content and nothing else.

The default slot is the body. A region that not every call site has is a named slot (`#footer`, `#actions`), and the container draws its region only when the slot is passed.

```vue
<!-- WRONG — the call site rebuilds the body and the footer, and each rebuild can get the scroll wrong -->
<UiDialog v-model="isOpen" title="Export">
  <fieldset p-3 flex flex-col gap-2 min-h-0 of-y-auto>…</fieldset>
  <footer p-3 flex gap-2 justify-end>…</footer>
</UiDialog>

<!-- CORRECT — the container scrolls the body and pins the footer -->
<UiDialog v-model="isOpen" title="Export">
  <UiCheckbox v-for="…" />
  <template #footer>…</template>
</UiDialog>
```

## What a call site never writes

- **A body wrapper** — a padded, scrolling, `min-h-0` element standing in for the body region.
- **A footer inside the default slot.** A footer in the default slot scrolls away with a long body, or sits inside a form's scroll.
- **A fixed height or a viewport height on a body.** The frame's maximum height and a flexible body decide the size, so a body is never `h-[76dvh]` or `min-h-64`.
- **A scroll on a child of a child.** A scroll is the body's, so a nested scroller leaves its parent to grow to its content and overflow the frame.

## One flag for the exception, never a second slot

A body that is a single full-bleed child — a listbox, a canvas — opts out of the padding with one boolean prop and keeps the scroll. The prop exists on a container only while a call site passes it: a container nothing draws bare has no such prop, and a content panel that pads itself is the cue to make its region bare rather than to pad twice. A second slot for bare content is a region one call site wants, and a slot earns its place by a second consumer (the `file-organization` skill, "Never Duplicate Similar Logic").

## Regions are shared by shortcut, not copied

Containers that look alike share one UnoCSS shortcut for the region: a dialog's body, a popover's panel, a settings panel and a blade's body all take the body shortcut, so they scroll and gap alike and a change lands in one place. The shortcut carries the scroll and the gap, and the container adds the padding, which a bare body leaves out; a footer's shortcut carries its own padding. A copied class list in each container is the drift this page exists to prevent.

## The container's state reaches content as slot props

State only the container owns — whether it is open, expanded or pending, the id of the form it hosts, a function that closes it — is a scoped slot prop, not a ref the call site keeps beside it (`references/slots.md`, "Fallback content is replaced whole"). A control in one region that belongs to a form in another names the form by its id (a submit in the footer carrying `form="id"` for a form in the body), so the container needs no wrapping element for both.

## A flex chain scrolls only if every link shrinks

A region scrolls inside a frame only when each flex ancestor down to it can shrink, which is `min-h-0` on every column in the chain. Three elements break the chain without saying so: a `<fieldset>` as a flex item (use a `div` with `role="group"`), a child that sets its own height, and a `display: grid` ancestor with an implicit row. A container's own test pins the structure that makes a body scroll inside its frame, and the overflow itself is proven in a driven browser, since a unit test measures no layout.

## Enforced by construction

The container makes the right shape the only shape, and `Ui/Dialog.scan.test.ts` fails a dialog call site whose default slot draws a scroll class, a `<footer>`, a fieldset or a viewport height. Nothing mechanical fails when a body overflows on one screen size, so a layout claim is read in a driven browser once, after the edits.

## The sweep

The `vue-components` ledger carries this page's rule. A pass reads each unit's containers and, per call site, asks whether it writes a region the container already owns, whether two containers draw the same region from copied classes, and whether a hand-built frame is a container that should exist. A hand-built frame appearing in three or more places is a finding for a new container, and one appearing in two is a note.
