## Purpose

Uploaded files are stored under the hash of their bytes, and a stored version references the files it uses. A published page, a revision and the working copy can therefore share one file without a copy, and a file is deleted only when no stored version names it.

## Requirements

### Requirement: Uploaded assets are addressed by the hash of their bytes

An uploaded asset SHALL be addressed by the hash of its bytes, so identical bytes uploaded to the same resource always resolve to the same address.

#### Scenario: Uploading the same bytes twice gives one address

- **GIVEN** an owner has uploaded an image into a resource
- **WHEN** the owner uploads a file with identical bytes into that same resource
- **THEN** the upload resolves to the address of the first image
- **AND** the owner's storage usage does not grow

#### Scenario: Identical uploads racing each other both succeed

- **GIVEN** two uploads of identical bytes into the same resource are in flight
- **WHEN** the second upload reaches storage after the first has stored the bytes
- **THEN** the second upload completes with the same address

### Requirement: A stored file whose bytes do not match its address is removed

A file stored under an address SHALL be removed if the bytes stored there do not hash to that address.

#### Scenario: Uploaded bytes that do not match their address are removed

- **GIVEN** a client stored bytes under an address that is not their hash
- **WHEN** the file's creation event is handled
- **THEN** the file is deleted
- **AND** the mismatch is logged

### Requirement: Publishing shares assets with the working copy

Publishing a resource SHALL reference the working copy's assets from the published version without copying them.

#### Scenario: Publishing a document with images copies no assets

- **GIVEN** a document whose content references three uploaded images
- **WHEN** the owner publishes the document
- **THEN** the publish completes without copying any image
- **AND** the published page shows the same three images as the working copy

### Requirement: Replacing or removing an asset leaves published pages unchanged

An owner's replacing or deleting an uploaded image SHALL NOT alter any published page that already shows it.

#### Scenario: Removing an image from the working copy keeps it on the published page

- **GIVEN** a published document shows an image that the working copy also shows
- **WHEN** the owner removes the image from the working copy
- **THEN** the published page still shows the image

#### Scenario: Unpublishing keeps an image the working copy still uses

- **GIVEN** a publication and the working copy both reference an image
- **WHEN** the owner unpublishes the document
- **THEN** the working copy still shows the image

### Requirement: An asset is kept while any stored version references it

An uploaded asset SHALL be deleted only when no stored version references it.

#### Scenario: Collecting one version keeps an asset another version uses

- **GIVEN** two stored versions reference the same image
- **WHEN** one of the two versions is collected
- **THEN** the image is still served to the other version

#### Scenario: Collecting the last reference deletes the asset and credits the owner

- **GIVEN** an image is referenced by one stored version only, and the counting-only period is not in effect
- **WHEN** that version is collected
- **THEN** the image is deleted
- **AND** the owner's storage usage falls by the size of the image

### Requirement: Every content type that embeds an asset keeps it

A stored version whose content embeds an asset address in any supported content type SHALL reference that asset for as long as the version is stored.

#### Scenario: An asset embedded in a stored version is kept while the version lives

- **GIVEN** a version whose content embeds an uploaded image's address
- **WHEN** the version is stored
- **THEN** the image is referenced by that version
- **AND** the image is not deleted while the version is stored

### Requirement: Collection waits out a counting-only period

An asset that no stored version references SHALL remain stored while collection is in its counting-only period.

#### Scenario: An unreferenced asset stays stored during the counting-only period

- **GIVEN** the counting-only period is in effect
- **WHEN** the last version referencing an image is collected
- **THEN** the image remains stored
- **AND** the image is counted as unreferenced

### Requirement: Deletion waits out the grace window

An asset SHALL NOT be deleted within a grace window after it was last written or re-uploaded, so a save that references an identical upload cannot lose the object to a collection running between the two.

#### Scenario: A re-uploaded asset is kept through the grace window

- **GIVEN** an asset no stored version references, last written within the grace window
- **WHEN** a collection runs
- **THEN** the asset is kept

### Requirement: A stored version never names a missing asset

Storing a version whose content references an asset that no longer exists SHALL fail, rather than store a version with a broken asset.

#### Scenario: A publish racing a file delete fails cleanly

- **GIVEN** a publish reads content that embeds an image
- **WHEN** the owner deletes the image before the version is stored
- **THEN** the publish fails with a retryable error
- **AND** no published version is stored that names the image

### Requirement: Published files are readable only while the current publication names them

An anonymous request for an asset SHALL be served only while the resource is published and its current published version references the asset.

#### Scenario: A working-only image is not public

- **GIVEN** a published page does not reference an image the working copy uses
- **WHEN** an anonymous request opens the image's address
- **THEN** the request is refused as unauthenticated

### Requirement: Counting-only period deletes nothing

While collection is in its counting-only period, release SHALL compute the unreferenced set and log its count, and SHALL delete nothing.

#### Scenario: Counting-only logs the unreferenced count

- **GIVEN** the counting-only period is in effect
- **WHEN** a version holding two assets is collected
- **THEN** no asset is deleted
- **AND** the count of unreferenced assets is logged
