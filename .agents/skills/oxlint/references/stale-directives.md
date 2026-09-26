# Stale Disable Directives

Read when hunting disable directives that no longer suppress anything.

## Finding stale disable directives

Let each linter judge its own — never read one's verdict on the other's:

```bash
# oxlint: only "Unused oxlint-disable" lines are real. It flags every
# eslint-disable for a plugin it lacks (perfectionist) as unused — false.
pnpm dlx oxlint --disable-nested-config --report-unused-disable-directives
# eslint: reports unused directives even for rules it has turned off
eslint . --report-unused-disable-directives
```
