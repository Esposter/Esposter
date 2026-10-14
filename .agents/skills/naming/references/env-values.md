# Environment Variable Values

Read when setting or reading a boolean environment variable the repo owns.

- **Our own env var values are always the strings `"true"` / `"false"` — never `"0"` / `"1"`.** Keeps every custom flag we set consistent and self-describing: a presence signal is `"true"`, and the install path sets `CI` to `"true"`. A boolean env var is spelled like a boolean. External vars with their own API are the dependency's (`references/names-a-dependency-owns.md`)
