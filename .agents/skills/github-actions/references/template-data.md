# Template Data and the Shell

Read when a step's `run` needs event, matrix or input data.

A `${{ }}` expansion is substituted into the script **before** any shell parsing, so event, matrix and input data interpolated into a command line is that data becoming command syntax. Every one goes into the step's `env:` and is read as a quoted `"$VAR"`:

```yaml
- name: ✅ ${{ matrix.name }}
  env:
    SCRIPT: ${{ matrix.script }}
  run: pnpm "$SCRIPT"
```

A `${{ }}` is fine in a field the shell never sees — `if:`, `name:`, `with:`, `working-directory:`, `key:` — and fine inline when the expression can only ever yield a literal the workflow wrote itself, as a boolean input rendering a flag: `pnpm … ${{ inputs.force == true && '--force' || '' }}`.
