# A Double That Fabricates an Entity Id

Read when a mock returns a persisted entity — a session, a user — or a new foreign key turns a suite red.

A mock standing in for something that returns a persisted entity — a session, a user, anything an id names —
must write the row as well as the object, whenever the suite has a database. A double that invents an id nothing
stored is a lie the suite cannot see: every read passes, and the **first foreign key added over that id turns
every write path red at once**, a package away from the mock that caused it.

When that happens, the constraint is the thing that is right. Fix the double, not the schema: an id that names
another table's row earns a foreign key, and tests fighting one are reporting their own fixture. Dropping the
constraint to make them pass buys a green suite and keeps the impossible state representable.

Two properties to preserve while making such a double truthful, because both are load-bearing elsewhere:

- **Freshness, where a suite drives one request per device.** Memoising the fabricated entity makes every
  "other device" the current one, and the tests that relied on per-call identity fail somewhere unrelated.
  Insert per call instead — if the real function is `async` and its callers await it, the mock can be too.
- **The harness's own writes must outlive a test's spies.** A suite stubbing `db.insert` to make application
  code fail will otherwise break the bookkeeping as collateral. Bind the real method once, when the database is
  created, and use that reference.
