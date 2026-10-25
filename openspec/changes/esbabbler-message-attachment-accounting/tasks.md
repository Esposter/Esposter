# Tasks

Build order. Section 1 lands the gate, section 2 the measurement, and sections 3 and 4 the release and the forward charge, which need the rows section 1 writes. The sweep closes the change.

## 1. Gate and mint

- [ ] 1.1 Write the message reserve helper in `apps/web/server/services/message/file/`. It reserves every original and thumbnail target for the uploader through `reserveStorageBytes`, then mints them. Test first: a reserve the allowance refuses returns no target and writes no ledger row.
      Verify: the helper's test names match the spec delta's scenarios, and the refused case asserts that no SAS is signed.
- [ ] 1.2 Route `generateUploadFileSasEntities` through the helper as a mutation, and move `useUploadFiles` to the mutation client. Test first in the router's test file: a drop of one image writes two ledger rows, one for the original and one for the thumbnail, both under the uploader.
      Verify: the router test passes, and the composer test shows the refusal text when the reserve refuses.
- [ ] 1.3 Add `MAX_THUMBNAIL_BYTES` beside `THUMBNAIL_CONTENT_TYPE` in the file constants, and reserve each thumbnail at that bound.
      Verify: the reserve test's thumbnail row carries exactly the constant, and the constant is imported rather than repeated.

## 2. Measure

- [ ] 2.1 Add the message-assets event subscription in prod and dev, and widen the handler's container list to message assets. Test first in the handler's test file: a `BlobCreated` on a message-assets blob charges its uploader the stored size, and one on a resource-asset blob still charges as before.
      Verify: the handler test passes. Its Pulumi preview is CI's, so the infra change is checked on the push.
- [ ] 2.2 Rewrite the handler's container comment and the ledger schema's comment, which both say message attachments are not counted or keyed by room.
      Verify: the two files hold no sentence that says a message attachment is uncounted, and the handler's comment names the uploader.

## 3. Release

- [ ] 3.1 Test first, in the message router's test file, that a deleted file, a discarded upload and a deleted room each return the uploader's counter to its value before the upload.
      Verify: the three cases pass with no change to the release code, which proves the existing path covers message assets.

## 4. Forward

- [ ] 4.1 Factor the HEAD-then-charge step out of `cloneContentAssets` into a helper both paths call, and charge each forwarded copy to the forwarder before its copy. Test first: a forward charges the forwarder the source's length before the copy, and a failed copy releases the charge and throws.
      Verify: the `cloneContentAssets` tests pass unchanged, and the forward test names match the spec delta.

## 5. Sweep and specs

- [ ] 5.1 Sweep the prose the change makes stale: the storage-quotas spec and design, the file-media design where it describes attachments, the deferred room-attachment design's opening paragraph, and the router comment. Search for "outside the personal storage quota", "Room attachments" and "not counted" across `openspec/` and `apps/`.
      Verify: the search returns no sentence that says a message attachment is uncounted, and the deferred page's revisit trigger names this change as the interim.
- [ ] 5.2 At archive, rewrite the storage-quotas design as built, with the message reserve, the second subscription and the forward charge in its Key files.
      Verify: the design's Key files table names every path the change touched, and `openspec validate` passes with the archive.
