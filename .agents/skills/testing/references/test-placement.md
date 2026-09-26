# Test Placement

Read when deciding which file a test goes in — beside its subject, folded into a nearby suite, or beside a module it scans. The one-line rule is in `SKILL.md`; this page is its full statement.

- **A test lives beside what it tests.** `Foo.ts` → `Foo.test.ts` in the same folder — never folded into a larger nearby suite whose fixtures happen to be set up already, and never moved to whatever module the check happens to _scan_: a test that reads the whole repo still belongs beside the thing it proves something about. Two checks walking the same directory are two files when they prove different things — one that scans a tree tests the tree, one that asserts a map's contents tests the map. The cost of folding is that nobody opening `Foo.ts` can tell it is covered.
