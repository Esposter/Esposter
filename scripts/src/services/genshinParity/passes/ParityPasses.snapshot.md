# Parity passes

Each component's last `pnpm -C scripts genshin:parity passes <component>`, which rewrites its own section: every
pass in order up to the first whose gate fails or that has no measure yet, which is the next work. Commit it with
the change that moved it, as a bench's report is committed.

## login

| Pass | Reading | Value | Gate | Unit | Held |
| :--- | :------ | ----: | ---: | :--- | :--- |
| Inventory | renderers unclaimed | 0 | 0 | renderers | yes |
| Layout | doorOverWalkway | 0.0023 | 0.0100 | cross-ratio | yes |
| Layout | Towers | 0.0061 | 0.0200 | m | yes |
| Layout | Bridges | 0.0061 | 0.0200 | m | yes |
| Layout | Door | 0.0020 | 0.0200 | m | yes |
| Layout | Door row across | 0 | 0.0200 | m | yes |
| Layout | Door row up | 0 | 0.0200 | m | yes |
| Layout | Bridges row across | 0 | 0.0200 | m | yes |
| Layout | Bridges row up | 0 | 0.0200 | m | yes |
| Layout | Towers row across | 0 | 0.0200 | m | yes |
| Layout | Towers row up | 0 | 0.0200 | m | yes |
| Layout | Walkway row across | 0 | 0.0200 | m | yes |
| Layout | Walkway row up | 0 | 0.0200 | m | yes |
| Layout | login-door-session Towers | 0.0658 | 2 | px | yes |
| Layout | login-door-session Bridges | 0.0640 | 2 | px | yes |
| Layout | login-door-session Door | 0.3361 | 2 | px | yes |
| Camera | login-door-session | 1.2470 | 2 | px | yes |
| Shape | login-door-session Door outline | 0.1071 | 1 | px | yes |
| Shape | login-door-session Door depth | 0.0001 | 0.0100 | share | yes |
| Shape | login-door-session Door normal | 7.5085 | 10 | degrees | yes |
| Shape | login-door-session Bridges outline | 0.2934 | 1 | px | yes |
| Shape | login-door-session Bridges depth | 0.0034 | 0.0100 | share | yes |
| Shape | login-door-session Bridges normal | 8.0577 | 10 | degrees | yes |
| Shape | login-door-session Towers outline | 0.4811 | 1 | px | yes |
| Shape | login-door-session Towers depth | 0.0033 | 0.0100 | share | yes |
| Shape | login-door-session Towers normal | 9.2350 | 10 | degrees | yes |
| Shape | login-door-session Walkway outline | 0.4927 | 1 | px | yes |
| Shape | login-door-session Walkway depth | 0.0005 | 0.0100 | share | yes |
| Shape | login-door-session Walkway normal | 5.9980 | 10 | degrees | yes |
| Motion | door lift path | 0.0066 | 0.0200 | m | yes |
| Motion | door lift pace | 0.0007 | 0.0100 | share | yes |
| Surface | login-door-session Door colour | 0.3250 | 2.3000 | ΔE | yes |
| Surface | login-door-session Door structure | 0.0560 | 0.0892 | share | yes |
| Surface | login-door-session Bridges colour | 1.0674 | 2.3000 | ΔE | yes |
| Surface | login-door-session Bridges structure | 0.0491 | 0.0331 | share | no |
| Surface | login-door-session Towers colour | 0.1170 | 2.3000 | ΔE | yes |
| Surface | login-door-session Towers structure | 0.1012 | 0.0257 | share | no |
| Surface | login-door-session Walkway colour | 0.1288 | 2.3000 | ΔE | yes |
| Surface | login-door-session Walkway structure | 0.0826 | 0.0172 | share | no |
| Surface | login-door-session Door glow colour | 0.3730 | 2.3000 | ΔE | yes |
| Surface | login-door-session Door glow structure | 0.1597 | 0.0931 | share | no |
| Surface | login-door-session Bridges glow colour | 7.3386 | 2.3000 | ΔE | no |
| Surface | login-door-session Bridges glow structure | 0.3291 | 0.2541 | share | no |
| Surface | login-door-session Towers glow colour | 0.6887 | 2.3000 | ΔE | yes |
| Surface | login-door-session Towers glow structure | 0.1925 | 0.0787 | share | no |
| Surface | login-door-session Walkway glow colour | 50.1179 | 2.3000 | ΔE | no |
| Surface | login-door-session Walkway glow structure | 0.8384 | 0.0269 | share | no |

## windrise

| Pass | Reading | Value | Gate | Unit | Held |
| :--- | :------ | ----: | ---: | :--- | :--- |
| Inventory | renderers unclaimed | 0 | 0 | renderers | yes |
| Layout | Statue row across | 0 | 0.0200 | m | yes |
| Layout | Statue row up | 0 | 0.0200 | m | yes |
| Layout | Oak row across | 0 | 0.0200 | m | yes |
| Layout | Oak row up | 0 | 0.0200 | m | yes |
| Layout | Paving row across | 0 | 0.0200 | m | yes |
| Layout | Paving row up | 0 | 0.0200 | m | yes |
| Layout | Ground row across | 0 | 0.0200 | m | yes |
| Layout | Ground row up | 0 | 0.0200 | m | yes |
| Camera | windrise-statue-day | 7.0178 | 2 | px | no |
