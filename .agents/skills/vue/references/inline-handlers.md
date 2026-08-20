# Inlining single-use functions and handlers

Read when naming, extracting, or reviewing a function used once — an event handler, a lifecycle callback, a `handleX`/`init`/`load` helper.

**A single-use function that only defers a block must be inlined.** A single reference is the _trigger_ for the question, not the answer to it. Ask what the name buys:

- **Ceremony → inline.** The name describes _when_ it runs (`onMount`, `init`, `load`, `setup`, `handleX`) and the body is simply the block its one caller would have contained. The name adds a jump and buys nothing, and inlining makes the file strictly smaller.
- **Abstraction → keep.** The name describes _what it computes_ (`getFooType`, `checkIsFoo`) and compresses a non-obvious computation — a switch, a predicate, a parse — so its call site reads as one idea. Inlining a 14-line switch into a loop body is bigger, more nested, and deletes the only word explaining what it means. Single use is not a reason to destroy it.

The discriminator: **does the name state its trigger or its result?** A trigger-named function is the caller wearing a disguise. A result-named function is a concept. Never inline a function whose call site would then need a comment to explain what the block does — that comment is the name you just removed.

## Ceremony, in every form

Not only callbacks passed as arguments:

- **Passed to a hook / registration** — `useEventListener("keydown", (event) => { ... })`, never a separate `onKeydown` used once. Arg types infer from the event name, so no annotation is needed.
- **Called inside a hook** — a named `onMount`/`init`/`load` that only `onMounted` invokes is the same violation wearing a different hat. Inline the body into `onMounted`. Wrapping it (`getResultAsync(onMount)`) does **not** make it a second reference:

  ```ts
  // WRONG — onMount is referenced once
  const onMount = async () => { ... };
  onMounted(async () => {
    await getResultAsync(onMount).match(noop, console.error);
    isLoading.value = false;
  });

  // CORRECT — the body lives where it runs
  onMounted(async () => {
    await getResultAsync(async () => { ... }).match(noop, console.error);
    isLoading.value = false;
  });
  ```

- **Template handlers** — a handler bound to exactly one element is ceremony, whatever its length. Inline it into the binding (`@submit="async (_, onComplete) => { ... }"`), which also lets Vue infer the event arg types. Multi-statement and `async` bodies are fine inline; the handler's trigger is the element it sits on, so that is where it belongs:

  ```vue
  <!-- WRONG — copyFooLink is bound once -->
  <StyledTooltipIconButton icon="mdi-content-copy" text="Copy link" @click="copyFooLink" />

  <!-- CORRECT -->
  <StyledTooltipIconButton icon="mdi-content-copy" text="Copy link" @click="async () => { ... }" />
  ```

  The one exception is **scope**: a template expression can only reach bindings `<script setup>` exposes to it. Top-level `const`s and imports are exposed, so `getResultAsync`/`noop`/a store method all inline fine. Things the template cannot name — `window` and other browser globals, a local `let`, a type annotation the body needs — force the handler to stay in script:

  ```ts
  // Stays named: the template cannot reference window
  const copyFooLink = async () => {
    if (!fooUrl.value) return;
    await getResultAsync(() => window.navigator.clipboard.writeText(`${window.location.origin}${fooUrl.value}`)).match(
      noop,
      noop,
    );
  };
  ```

- **Trivially-typed lambdas** — never extract one whose arg types are already inferable.

## Legitimate reasons to keep a name

- It names a **result**, not a trigger (see above) — single use is fine.
- The handler references something the **template has no scope for** (`window.…`, a type annotation).
- The same **reference** is needed twice (`addEventListener` + `removeEventListener`), or one handler is bound to two elements.
- It is the component's **public API** via `defineExpose({ onKeyDown })` — the expose _is_ the second reference.
- A mutation must re-run a setup read: `refreshFoos` awaited at setup **and** bound to `@delete`.

## Handler details

- **`@click` shorthand** — a single async call uses `@click="myAsyncFn(args)"` directly; no `async () => { await ... }` wrapper.
- **IME composition guard** — on `@keydown.enter` for text inputs, guard inline so confirming a CJK candidate doesn't commit: `@keydown.enter.stop="!$event.isComposing && commitEdit()"`.

## `useEventListener` is what makes a listener inlinable

**Prefer `useEventListener` over manual `addEventListener`/`removeEventListener`** — it auto-removes on unmount, replacing an `onMounted`/`onUnmounted` pair and letting the handler be inlined. Omit the target for `window` events (`useEventListener("resize", ...)`) — the omitted-target form is SSR-safe (don't reference `window` at setup top-level). Fall back to manual hooks only when the target isn't reachable SSR-safely as a getter and the listener is genuinely tied to mount.
