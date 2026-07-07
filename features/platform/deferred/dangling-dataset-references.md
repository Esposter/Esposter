# Dangling Dataset References

Handling a `DatasetReference` whose source resource has been deleted, so a bound Dashboard visual or Email merge field surfaces a clear "source no longer available" state instead of a silent empty/failed resolve.

## Why deferred

Links are stored as bare `DatasetReference` ids (`{ type, id }`), not Postgres foreign keys, so a source delete cannot cascade. Today the consumer re-resolves on load and `dataset.readDataset` fails/returns empty — acceptable while binding is new and single-owner. Reference-integrity UX (dependency lookup on delete, a "broken link" placeholder in the consumer) is real cross-resource wiring to add only once binding is proven and users actually hit it. Published snapshots are unaffected — they bake the data in at publish time.

## Revisit when

Dashboard binding / Email merge fields ship and a real user deletes a source that another resource references, and the silent-empty behaviour is an observed annoyance.

## Cheaper interim

On resolve failure, the consumer renders `StyledEmptyState` ("source no longer available") in place of the visual/field rather than erroring — no delete-time dependency scan.
