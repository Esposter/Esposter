## 1. Map

- [ ] 1.1 List each README section against its owning file and mark it keep, index, or remove — verify the list covers every `##` heading in README.md.

## 2. Reduce

- [ ] 2.1 Replace each restated table or list marked remove with a one-line pointer to its owner — verify the README word count falls below 1,000 and every pointer path exists.
- [ ] 2.2 Keep the install block and the third-party notices unchanged — verify by diff that both are byte-identical to before.

## 3. Check

- [ ] 3.1 Add a Verify-Config check that the README names no skill table and no hook list, and see it fail on the current README first — verify RED, then GREEN after 2.1.

## 4. Close-out

- [ ] 4.1 Run `.\scripts\Verify-Config.ps1` — verify GREEN.
- [ ] 4.2 Run `openspec validate readme-pointer --strict --no-interactive` — verify exit 0.
