## Purpose

Azure Activity-log parity — a per-resource audit trail in Azure Table Storage, rendered as a built-in blade on every resource type. The trail covers only the one resource it belongs to, and it is kept until that resource is purged.

## Requirements

### Requirement: Every resource records its lifecycle in an Activity blade

The resource owner SHALL be able to read a newest-first activity trail for each of their resources, covering creation, renames, saves, publishes, unpublishes, duplicates and restores.

#### Scenario: Opening the Activity blade shows the newest entries first

- **GIVEN** a resource that has been renamed and then saved
- **WHEN** the owner opens the Activity blade for that resource
- **THEN** the newest entry is listed first
- **AND** each entry names the kind of change that happened

#### Scenario: A new resource shows its creation entry

- **GIVEN** a resource that has never been changed since it was created
- **WHEN** the owner opens the Activity blade for that resource
- **THEN** the trail shows its creation entry

### Requirement: Activity writes never fail the change they describe

The system SHALL complete the owner's change before recording its activity, and SHALL NOT let a failure to record activity fail or roll back the change.

#### Scenario: A failed activity write leaves the save in place

- **GIVEN** the owner saves a resource
- **WHEN** recording the activity for that save fails
- **THEN** the save still succeeds
- **AND** the failure is logged for the operator

#### Scenario: A creation that cannot be recorded is rolled back with its resource

- **GIVEN** creating a resource fails after its entry is written
- **WHEN** the creation is rolled back
- **THEN** no activity entry for that resource remains readable

### Requirement: Repeated content saves are coalesced

The system SHALL record at most one content-saved entry per owner and per API key within any one hour, so that autosave does not flood the trail.

#### Scenario: A burst of saves within an hour records one entry

- **GIVEN** the owner has a content-saved entry from the last hour
- **WHEN** the owner saves the resource again
- **THEN** no further content-saved entry is added to the trail

#### Scenario: A save after an hour records a new entry

- **GIVEN** the owner's last content-saved entry is more than an hour old
- **WHEN** the owner saves the resource
- **THEN** a new content-saved entry is added to the trail

#### Scenario: An agent's saves are kept apart from the owner's

- **GIVEN** the owner has a content-saved entry from the last hour
- **WHEN** an agent using its own API key saves the resource
- **THEN** the agent's save is recorded as its own content-saved entry

### Requirement: Agent-made changes name the API key that made them

The system SHALL name the API key an agent used on each entry it writes, and SHALL keep that name on the entry after the key is renamed or deleted.

#### Scenario: An agent's change is labelled with its key

- **GIVEN** an agent using an API key renames a resource
- **WHEN** the owner reads the Activity blade
- **THEN** the rename entry shows the name of that API key in its detail

#### Scenario: A renamed API key keeps its old name in the trail

- **GIVEN** an entry was written by an API key that has since been renamed
- **WHEN** the owner reads the Activity blade
- **THEN** the entry still shows the name the key had when it wrote

### Requirement: Restores appear in the trail

The system SHALL record a restored entry whenever content is restored from the recycle bin or from a snapshot.

#### Scenario: Restoring from the recycle bin is recorded

- **GIVEN** a resource in the recycle bin
- **WHEN** the owner restores it
- **THEN** a restored entry is added to its trail

#### Scenario: Restoring a snapshot into the working copy is recorded

- **GIVEN** a resource with a published snapshot
- **WHEN** the owner restores that snapshot into the working copy
- **THEN** a restored entry is added to its trail

### Requirement: The trail is kept until the resource is purged

The system SHALL keep a resource's activity through soft deletion and restore, and SHALL remove it only when the resource is purged.

#### Scenario: Soft-deleted resources keep their trail

- **GIVEN** a resource has been moved to the recycle bin
- **WHEN** the owner restores it
- **THEN** its earlier activity is still listed

#### Scenario: Purging a resource removes its trail

- **GIVEN** a resource is purged
- **WHEN** the purge completes
- **THEN** no activity for that resource can be read

#### Scenario: A failed purge clean-up is retried

- **GIVEN** the clean-up of a resource's trail fails during purge
- **WHEN** the purge runs again
- **THEN** the trail is cleared and the purge completes

### Requirement: Each entry carries only the fields its kind needs

The system SHALL attach only the detail that applies to an entry's kind, so that a rename entry says nothing about publishing.

#### Scenario: A rename entry shows the old and new names

- **GIVEN** a resource is renamed from one name to another
- **WHEN** the owner opens the entry
- **THEN** the entry shows the old name and the new name

#### Scenario: A publish entry shows its version

- **GIVEN** a resource is published
- **WHEN** the owner opens the entry
- **THEN** the entry shows the published version number

### Requirement: The trail is per resource and shows no actor column

The system SHALL show each resource's trail only for that resource, and SHALL NOT show a separate actor column, since the owner is the only actor.

#### Scenario: The trail does not span resources

- **GIVEN** the owner has activity on two resources
- **WHEN** the owner opens the Activity blade for one of them
- **THEN** only that resource's entries are listed

#### Scenario: Entries show no actor column

- **GIVEN** the owner opens the Activity blade
- **WHEN** the trail is shown
- **THEN** no actor column appears, and only an agent's key is named in an entry's detail
