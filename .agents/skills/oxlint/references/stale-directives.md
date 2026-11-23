# Stale Disable Directives

Read when hunting disable directives that no longer suppress anything.

## Finding stale disable directives

Oxlint reports its own unused script directives:

```bash
pnpm exec oxlint --disable-nested-config --report-unused-disable-directives
```

A template directive has no unused-directive report. To check one, remove it and run `vize lint <file>` on its component: if nothing is reported, the directive was stale; if a finding appears, the directive goes back in.
