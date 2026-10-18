## 1. The respawn check reads the world clock

- [x] 1.1 Check a defeated camp member's respawn against the moment given, back once the server's reset arrives. Verify: `services/enemy/checkIsEnemyRespawned.test.ts` written first and seen failing, with the scenarios 'an elite camp's member stays down until the server's reset arrives' and 'an elite camp's member is back when the server's reset arrives'.
- [x] 1.2 Time the enemies' defeats, jumps and claims on `getWorldNow`, check each respawn with `checkIsEnemyRespawned`, and thread `getWorldNow` from Session through Windrise. Verify: the wiring is typechecked at integration, since the components have no unit test here; the rule it carries is task 1.1's test.

## 2. The domains read the game day

- [x] 2.1 Take the moment checked in the kind and the level checks, and read its game day from the reset clock. Verify: `services/domains/checkIsDomainKindOpenOnDay.test.ts` and `services/domains/checkIsDomainLevelOpen.test.ts` written first and seen failing, with the scenarios 'a moment before the reset takes the previous game day's opening' and 'a moment at the reset takes the new game day's opening'.

## 3. The pages

- [x] 3.1 Describe the world clock on the domains design and the save-data and enemies pages, in place of the device clock and the caller's day. Verify: a grep of `openspec/specs/genshin` for "local clock" and "caller passes the game's day" finds no match.
