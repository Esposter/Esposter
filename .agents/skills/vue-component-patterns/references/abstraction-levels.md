# One Level of Abstraction

Read when a `<script setup>` mixes a composable call with a hand-built block for the same concept, or a `v-if` exists only so the body can skip absence checks.

Every statement in `<script setup>` must operate at the same conceptual level. **If one line calls a composable encapsulating a concept, all other lines should be at that same call-site level** — not implementing sub-steps inline.

**Signals abstraction levels are mixed:**

- A store or composable call sits next to a manual `ref` + `computed` + `watch` block implementing the same concept (e.g. a `selectedFooId` ref plus a lookup computed plus a watch pruning stale selections, beside a `useFooStore()` that already owns selection).
- A `v-if="x"` guard exists only so the template body can skip absence checks (extract to a child component receiving a required prop instead).
- Inline `watch` callbacks contain multi-step logic that belongs in a composable.

**Fix:** move the lower-level block to its owner — a store (selection state, shared reactive data — see the `pinia` skill) or a `use*` composable — then call it at the same level as everything else.
