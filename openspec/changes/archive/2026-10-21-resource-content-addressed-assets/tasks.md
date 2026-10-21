## 1. Addressing

- [ ] 1.1 Address uploads by the hash of their bytes, so identical bytes resolve to one object for an owner. Verify: a test named after the scenario 'Uploading the same bytes twice gives one address'.
- [ ] 1.2 Sign the upload for the hash address and return that address to the uploader. Verify: a test named after the scenario 'Uploading the same bytes twice gives one address'.

## 2. References

- [ ] 2.1 Add the version-to-asset reference table, registered beside the existing tables. Verify: a test named after the scenario 'An asset embedded in a stored version is kept while the version lives'.
- [ ] 2.2 Scan each version's content for asset addresses when the version is written, and record one reference row per address. Verify: a test named after the scenario 'An asset embedded in a stored version is kept while the version lives'.
- [ ] 2.3 Drop a collected version's reference rows, and delete only assets that no row names. Verify: tests named after the scenarios 'Collecting one version keeps an asset another version uses' and 'Collecting the last reference deletes the asset and credits the owner'.

## 3. Publishing

- [ ] 3.1 Stop cloning assets and rewriting urls on publish, and delete the clone walk with its test. Verify: a test named after the scenario 'Publishing a document with images copies no assets'.
- [ ] 3.2 Keep assets that the working copy still references when a publication is removed. Verify: a test named after the scenario 'Unpublishing keeps an image the working copy still uses'.
- [ ] 3.3 Keep the published page's images when the owner replaces or removes them in the working copy. Verify: a test named after the scenario 'Removing an image from the working copy keeps it on the published page'.

## 4. Rollout

- [ ] 4.1 Ship with assets counted but never collected, and enable collection after the counting-only period. Verify: a test named after the scenario 'An unreferenced asset stays stored during the counting-only period'.
