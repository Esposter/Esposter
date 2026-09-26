# Imperative Navigation

Read when code navigates — a redirect after a write, a submit, a guard, or a target computed at click time.

`navigateTo(target, options)` is the imperative form: post-mutation redirects, form submits, route guards, and dynamic-only targets with no element to hang `:to` on (search submit, a data table's row click).

`router.push` is lint-enforced against (`vue/no-restricted-syntax`, same file) — use `navigateTo(target, { replace: true })`. A query-only `router.replace({ query })` is not navigation and is fine.

**Always `await` (or return) `navigateTo`** — it is async, and a floating statement-position call is a violation: the promise escapes Vue's async error handling and code after it runs before navigation settles.

- Multi-statement handler or script code → `async` function with `await navigateTo(...)`.
- Middleware → `return navigateTo(...)`.
- A **single-expression** inline handler (`@click="navigateTo(...)"`, `@click="cond && navigateTo(...)"`, one-expression arrow) is already compliant — the expression's promise is implicitly returned into Vue's `callWithAsyncErrorHandling`, which is the sanctioned "or return" form. Do not churn these into `async () => await ...`.
