# Parity passes

Each component's last `pnpm -C scripts genshin:parity passes <component>`, which rewrites its own section: every
pass in order up to the first whose gate fails or that has no measure yet, which is the next work. Commit it with
the change that moved it, as a bench's report is committed.

## login

| Pass | Reading | Value | Gate | Unit | Held |
| :--- | :------ | ----: | ---: | :--- | :--- |
| Inventory | renderers unclaimed | 0 | 0 | renderers | yes |
| Layout | doorOverWalkway | 0.0023 | 0.0100 | cross-ratio | yes |
| Layout | towers | 0.0063 | 0.0200 | m | yes |
| Layout | bridges | 0.0061 | 0.0200 | m | yes |
| Layout | door | 0.0020 | 0.0200 | m | yes |
| Layout | Door row across | 0 | 0.0200 | m | yes |
| Layout | Door row up | 0 | 0.0200 | m | yes |
| Layout | Bridges row across | 0 | 0.0200 | m | yes |
| Layout | Bridges row up | 0 | 0.0200 | m | yes |
| Layout | Towers row across | 0 | 0.0200 | m | yes |
| Layout | Towers row up | 0 | 0.0200 | m | yes |
| Layout | Walkway row across | 0 | 0.0200 | m | yes |
| Layout | Walkway row up | 0 | 0.0200 | m | yes |
| Camera | login-door-session | 1.2470 | 2 | px | yes |
| Shape | login-door-session Door outline | 0.1071 | 1 | px | yes |
| Shape | login-door-session Door depth | 0.0001 | 0.0100 | share | yes |
| Shape | login-door-session Door normal | 7.4508 | 10 | degrees | yes |
| Shape | login-door-session Bridges outline | 0.5095 | 1 | px | yes |
| Shape | login-door-session Bridges depth | 0.0055 | 0.0100 | share | yes |
| Shape | login-door-session Bridges normal | 9.2048 | 10 | degrees | yes |
| Shape | login-door-session Towers outline | 0.5270 | 1 | px | yes |
| Shape | login-door-session Towers depth | 0.0063 | 0.0100 | share | yes |
| Shape | login-door-session Towers normal | 11.8245 | 10 | degrees | no |
| Shape | login-door-session Walkway outline | 3.1163 | 1 | px | no |
| Shape | login-door-session Walkway depth | 0.0056 | 0.0100 | share | yes |
| Shape | login-door-session Walkway normal | 9.9457 | 10 | degrees | yes |
