## ADDED Requirements

### Requirement: Every static file lives in exactly one place

A static file SHALL live in exactly one of three places: bundled, hosted or public, and the place SHALL be decided by whether its url must be fixed, whether an engine loader reads it, and its size.

#### Scenario: An engine-read texture is hosted

- **GIVEN** a texture that the game's engine loader reads by url
- **WHEN** the file is placed
- **THEN** it is published as a hosted object, not imported into the bundle
- **AND** no file the engine loader reads remains in the app's bundle

#### Scenario: A small UI icon is bundled

- **GIVEN** an icon of a few kilobytes that the interface imports
- **WHEN** the file is placed
- **THEN** it is bundled beside the code that names it

### Requirement: A hosted object is named by the hash of its bytes

A hosted object SHALL be stored under a name derived from the sha256 of its content, so the same bytes always have one url and a changed file always has a new one.

#### Scenario: Republishing unchanged bytes keeps the url

- **GIVEN** a hosted object already published under its hash
- **WHEN** its source is published again without any change
- **THEN** the object keeps its url and no new object is written

#### Scenario: Changed bytes get a new url

- **GIVEN** a hosted object whose source file has changed
- **WHEN** the source is published
- **THEN** the object is stored under a new name, and the old name still resolves to the old bytes

### Requirement: A publish refuses an object that breaks the placement rules

A publish SHALL refuse, before it writes any object, a WAV file or a file over the object size cap, and SHALL name each refused file.

#### Scenario: A WAV file is refused

- **GIVEN** a product's source folder holding a WAV file
- **WHEN** the product is published
- **THEN** the publish fails and names the WAV file
- **AND** no object of the product is written

#### Scenario: A file over the cap is refused

- **GIVEN** a source file larger than the object size cap
- **WHEN** the product is published
- **THEN** the publish fails and names the file
- **AND** the lock on disk is left as it was

### Requirement: A committed lock names only objects that are verified

A publish SHALL verify each object it stores, and each object its next lock names that the current lock does not, by reading it back and hashing its decoded bytes against the sha256 in its name. It SHALL commit the lock only after every such object has passed. An object the current lock already names was verified when that lock was committed, so a publish whose next lock equals the current one SHALL make no request.

#### Scenario: A mismatched object stops the commit

- **GIVEN** a publish in which one object reads back with bytes that do not hash to its name
- **WHEN** the publish verifies its objects
- **THEN** the publish fails
- **AND** the committed lock is unchanged

#### Scenario: A rerun of an unchanged plan makes no request

- **GIVEN** a publish whose plan the committed lock already names
- **WHEN** the publish runs for real
- **THEN** no bucket is requested
- **AND** the publish reports the lock as unchanged

#### Scenario: A verified publish writes both environments

- **GIVEN** a publish of objects that all verify
- **WHEN** the publish completes
- **THEN** every object is present in the development and the production bucket
- **AND** the lock is committed only after both buckets hold every object

### Requirement: Hosted objects are cached immutably at the edge

A hosted object SHALL be served from the one hosted origin with an immutable one-year cache header and the content type and encoding it was published with, and its cache status SHALL be readable in the response.

#### Scenario: A repeat request is a cache hit

- **GIVEN** a hosted object that has been requested once from a data center
- **WHEN** the same url is requested again from that data center
- **THEN** the response reports a cache hit
- **AND** it carries `Cache-Control: public, max-age=31536000, immutable`

#### Scenario: A missing object is a 404

- **GIVEN** a url whose hash names no published object
- **WHEN** it is requested
- **THEN** the response is a 404, whose body is the bucket domain's own Not Found page and never another object

### Requirement: The preloader downloads every object of a lock before a game starts

A product's preloader SHALL download every object its lock names that the browser's cache lacks, before the product starts, and SHALL report the bytes downloaded as the progress its loading bar shows.

#### Scenario: A second visit downloads nothing

- **GIVEN** a product whose every object is held in the browser's cache
- **WHEN** the product preloads
- **THEN** no object is requested from the network
- **AND** the progress reads complete

#### Scenario: A failed download keeps the previous cache

- **GIVEN** a preload in which an object fails its attempts
- **WHEN** the preload stops
- **THEN** the preloader reports the failed paths
- **AND** every cache entry it held before the preload is kept

### Requirement: A successful preload evicts only its own product's stale objects

A successful preload SHALL delete the cached objects under its own product's scope prefixes that its lock no longer names. Objects under another product's prefix are never deleted, and a failed preload deletes none.

#### Scenario: A stale object of one product is evicted and another product's object is kept

- **GIVEN** one shared cache holding a stale object of product A and an object of product B that A's lock does not name
- **WHEN** product A's preload succeeds
- **THEN** A's stale object is deleted from the cache
- **AND** B's object is kept

#### Scenario: A failed preload deletes nothing

- **GIVEN** a stale object of product A in the cache
- **WHEN** product A's preload fails
- **THEN** the stale object is kept

### Requirement: Tests read hosted objects from a local mirror

A test SHALL read hosted objects from a local mirror keyed on the product's lock, so no test makes a network request for a hosted object.

#### Scenario: A suite that loads a hosted object runs offline

- **GIVEN** a suite that reads a product's objects
- **WHEN** it runs with no network
- **THEN** every object resolves from the mirror and the suite passes

### Requirement: A lost object is restored from the other environment's bucket

A repair SHALL copy each object or index a product's lock names that one environment's bucket lacks from the other environment's bucket, verifying the source against its name and the lock's length. A name that neither bucket holds SHALL fail the repair, named by its key.

#### Scenario: A lost object is restored from the other bucket

- **GIVEN** a product whose lock names an object the production bucket has lost, and the development bucket still holds
- **WHEN** the product is repaired
- **THEN** the object is copied into the production bucket
- **AND** it reads back with the bytes its name gives
