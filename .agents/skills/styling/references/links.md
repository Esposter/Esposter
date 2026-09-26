# Links and Inline Actions

Read when styling a link, or inline text that runs an action.

Hyperlinks / clickable inline text get `text-info` — that is the conventional link blue, underlined on hover rather than always (`hover:underline`). `text-accent` is the brand/action accent, not a link colour. It applies to `NuxtLink`, `NuxtInvisibleLink` and every inline "click here" affordance, whichever of them a case calls for.

**Inline text that runs an action rather than navigating is a native `<button type="button">` in the link colour, never a hand-styled span or a raw `<a>`.** A raw `<a>` is lint-banned, and a span has none of the focus, role and keyboard wiring a button carries for free — which is how one of them ends up unfocusable. The button takes the link's look and a `@click`, and its children are the words in the sentence, as the room-rename system line does (`apps/web/app/components/Message/Model/Message/Type/EditRoom.vue`): `<button type="button" text-info cursor-pointer hover:underline @click="isEditRoomDialogOpen = true">Edit Room</button>`. A link that navigates stays a `NuxtLink`.
