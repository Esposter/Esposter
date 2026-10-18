## Purpose

The FileAssets capability — hosted binary assets under {id}/files, served through stable app urls via /api/resource-assets.

## Requirements

### Requirement: Uploaded files are hosted with their resource

An owner SHALL be able to upload a file to a resource whose type supports file assets, and the file SHALL be hosted with that resource.

#### Scenario: Owner uploads an image into a webpage

- **GIVEN** the owner has a webpage open in its editor
- **WHEN** the owner uploads an image through the asset manager
- **THEN** the image is hosted with the webpage
- **AND** the webpage references it by an app address

#### Scenario: Upload to a type without file assets

- **GIVEN** a resource type does not support file assets
- **WHEN** an upload is attempted against it
- **THEN** the upload is refused

### Requirement: Content references files by a stable address

Content SHALL reference an uploaded file by a stable app address that does not expire.

#### Scenario: Address keeps working after the link would have expired

- **GIVEN** a page references an uploaded image
- **WHEN** the owner opens the image address a day later
- **THEN** the image is shown

#### Scenario: Malformed address is refused

- **GIVEN** a request for a file address that cannot be parsed
- **WHEN** the request is made
- **THEN** the request is refused as a bad request

### Requirement: Working-copy files are visible only to the owner

A file in the working copy of a resource SHALL be visible only to the resource's owner.

#### Scenario: Another user opens a working-copy file

- **GIVEN** an owner's working copy references an uploaded image
- **WHEN** a different user opens the image's address
- **THEN** the image is not shown

#### Scenario: Anonymous request for a working-copy file

- **GIVEN** an owner's working copy references an uploaded image
- **WHEN** a request without signing in opens the image's address
- **THEN** the request is refused as unauthenticated

### Requirement: Published files stay viewable while the resource is published

A file in a published resource SHALL remain viewable by anyone for as long as the resource is published.

#### Scenario: Unpublishing revokes published file access

- **GIVEN** a published page references an uploaded image
- **WHEN** the owner unpublishes the page
- **THEN** the image's published address no longer shows the image

### Requirement: Published pages keep their own copies of their files

A published page SHALL keep its own copies of the files it uses, so replacing or deleting a working file does not break the published page.

#### Scenario: Owner deletes a working file after publishing

- **GIVEN** a page was published with an uploaded image
- **WHEN** the owner deletes that image from the working copy
- **THEN** the published page still shows the image

### Requirement: Duplicates keep their own copies of their files

A duplicated resource SHALL have its own copies of every file it uses, so deleting or unpublishing the original does not break the copy.

#### Scenario: Original is unpublished after duplicating

- **GIVEN** a published page was duplicated
- **WHEN** the owner unpublishes the original
- **THEN** the copy still shows its images

### Requirement: Deleted resources stop serving their files

Files of a deleted resource SHALL stop being served as soon as the resource is deleted.

#### Scenario: Published file of a deleted resource

- **GIVEN** a published page references an uploaded image
- **WHEN** the owner deletes the page
- **THEN** the published image address no longer shows the image

### Requirement: The owner can delete one uploaded file

The owner SHALL be able to delete a single uploaded file while the resource remains.

#### Scenario: Owner removes an image from a survey

- **GIVEN** a survey has an uploaded image question
- **WHEN** the owner deletes that image
- **THEN** the image is removed
- **AND** the survey remains

### Requirement: Uploads count against the owner's storage quota

Uploaded files SHALL count against the owner's storage quota, and an upload that would exceed it SHALL be refused.

#### Scenario: Upload over the quota

- **GIVEN** the owner has used all of their storage allowance
- **WHEN** the owner uploads a file
- **THEN** the upload is refused
