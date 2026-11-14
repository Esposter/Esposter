## Purpose

The cost ceiling and the protection decisions the Cloudflare estate keeps: nothing is shut off by spend, stateful resources are protected from deletion, and stored objects are private unless their bucket is public.

## Requirements

### Requirement: Nothing is shut off by spend

The estate SHALL NOT stop or delete a running product because metered spend registers.

#### Scenario: Spend registers on the account

- **GIVEN** metered spend registers on the account
- **WHEN** the account is billed
- **THEN** no Worker, database, bucket, queue or queue consumer is stopped or deleted by the estate's own automation

### Requirement: No spend alert is declared until the provider can declare one

The infrastructure program SHALL NOT declare a spend alert while the provider cannot express its total-spend filter, and SHALL NOT create one by hand.

#### Scenario: Infrastructure previewed

- **GIVEN** an infrastructure change is previewed for the account
- **WHEN** the preview lists the resources
- **THEN** no billing notification is listed

### Requirement: Stateful resources are protected from deletion

Every database, bucket, queue and queue consumer SHALL be protected, so that a change cannot delete it silently.

#### Scenario: A change would delete a database

- **GIVEN** a protected D1 database
- **WHEN** a change would delete it
- **THEN** the deletion is refused and the database and its rows stay in place

#### Scenario: A change would replace a bucket

- **GIVEN** a protected R2 bucket that holds objects
- **WHEN** a change would replace it
- **THEN** the replacement is refused and the objects stay in the bucket

### Requirement: Deletions check their references first

An infrastructure change SHALL check the bindings, consumers, custom domains and DNS records that reference a resource before the change deletes it.

#### Scenario: A change deletes a queue

- **GIVEN** a change would delete a queue
- **WHEN** the change is reviewed
- **THEN** the queue consumer and the Worker bindings that name the queue are checked first

### Requirement: Stored objects are private unless their bucket is public

An object SHALL be read through a short-lived presigned URL unless its bucket is a public bucket, and a public bucket's objects SHALL be served on the public custom domain.

#### Scenario: A private object is read

- **GIVEN** an object in a bucket without the public prefix
- **WHEN** a person reads it
- **THEN** the read is made with a presigned GET URL

#### Scenario: A public object is read

- **GIVEN** an object in a public bucket
- **WHEN** a person reads it
- **THEN** it is served on the public custom domain
