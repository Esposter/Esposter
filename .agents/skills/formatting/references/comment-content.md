# What a Comment Says

Read when writing or reviewing what a comment says. The one-line rules are in `SKILL.md`; this page is each in full, with the two history exceptions.

- **CRITICAL — comment only _exceptional_ behaviour.** A comment earns its place only when it explains something a competent reader could not infer from the code, its names, or the project's own conventions. **Never restate an established pattern or anything already documented in a skill or feature doc.** The skill/doc is the single source of truth; duplicating it in a comment is noise that rots. Concretely, delete comments that:
  - restate a convention covered by a skill (e.g. "a `.test.ts` so the barrel generator keeps it out of the public barrel", "the result helper turns the throw into false, per the error-handling convention", "memoized because…" when memoization is the obvious idiom);
  - paraphrase what a well-named function/variable already says ("// resolve the foo" above `resolveFoo()`);
  - duplicate a rationale already written in a sibling file — state it once at the source, not at every call site.

  Keep comments for genuinely non-obvious _why_: a workaround for a specific external bug/quirk, a subtle ordering/race constraint, an overlayfs/kernel/platform footgun, a security boundary. When in doubt, prefer deleting — a wrong-but-confident comment is worse than none.

- **CRITICAL — comments describe the present, never the history.** A comment states what the code does and why it does it _now_, never how it used to work or what it replaced; git is the changelog. Delete any clause that only makes sense as a before/after story — `equivalent to the old X`, `replaces the former Y`, `now that Z the old reason is moot`, `used to …`, `no longer needed since …` — and rewrite it to assert the current behaviour. **Migration state is history too**: no roadmap phases, no "until X lands", no transitional wiring in a code comment; sweep those in the change that completes the migration, since the roadmap doc is where phase history lives. Mention a rejected **alternative** only where the reader needs it to not "fix" the code back to it, in one clause.

  ```ts
  // WRONG — narrates removed behaviour
  // `foo()` (equivalent to the old `bar()`) provisions both layers.
  // Now that baz persists its output, the old discarded-buffer reason is moot; the real blocker is nesting.

  // CORRECT — states the present reason only
  // `foo()` provisions both layers.
  // Runs on the host, not the sandbox: a nested sandbox is forbidden inside the outer one.
  ```

  Two narrow exceptions survive because they still help the _current_ reader: (1) a comment quoting the **actual external error/warning text** a workaround addresses (it's how the next person greps the cause — see below); (2) a **regression guard** in a test may name the failure mode it defends against, phrased as a present hazard (`coupling both to one check flips this assertion`), not as a past state (`a regression to the old gate`).

- **A comment explains the code, never the change that produced it.** "Stated once rather than left to drift",
  "cached because it is read twice", "shared so a control added here reaches both" — these argue for a refactor
  that has already happened, to a reader who is looking at the result and cannot see the alternative. They are
  also the convention restated at the call site: reuse, work and identity are the `vue` skill's, deduplication is
  `file-organization`'s, and a rule copied beside one of its instances is the copy that goes stale. Write what the
  code does and the non-obvious constraint it is under; if the pass turned up a rule worth stating, state it in
  the owning skill, where every future reader gets it instead of this one file's reader.

- **Keep comments tight and generic** — explain the _why_ in general terms; don't bake in specific example values (versions, IDs, payloads, magic numbers). Prefer a single line, but keep a bulleted list (one item per `//` line) when enumerating distinct items rather than cramming them into one sentence. If an example helps, show only the minimal fragment. Applies to `//`, `/* */`, and Vue `<!-- -->` alike.

- **Keep error/warning examples** — when a comment quotes the actual error or warning text a workaround addresses (e.g. `[Vue warn]: Invalid prop: type check failed`), keep that quote — it's how the next person greps for the cause. Trim it to the minimal identifying fragment; drop surrounding example values.
