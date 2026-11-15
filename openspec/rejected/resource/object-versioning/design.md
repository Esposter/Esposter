# Object versioning

Keeping each save of a resource as a non-current version of its storage object, instead of a snapshot of the resource.

## Why not

**A resource version is not an object version.** It is `content.json` _plus the assets it references_, and a versioned object keeps its own timeline with no cross-object consistency point — so "restore this resource as of Tuesday" resolves to Tuesday's JSON pointing at asset objects since replaced or deleted. Cloning the assets alongside the content is a thing the application does and the storage layer cannot.

Two lesser reasons, each independently sufficient: a non-current object version would be **billed but invisible to the ledger**, which charges the current object and settles it from the object-create event ([storage quotas](../../../specs/resource/storage-quotas/design.md)); and a version is addressed by an opaque id nothing in the app stores, lists or hands to a restore.
