# infra/cloudflare-tokens Specification

## Purpose

Every Cloudflare account token the estate uses is declared in the Pulumi program, each consumer holding only the permission groups its calls need, and the one token made by hand is the bootstrap token that creates the others.

## Requirements

### Requirement: Only the bootstrap token is made by hand

Every Cloudflare account token the estate uses SHALL be an `AccountToken` resource declared in code, except the one bootstrap token that creates the others. The bootstrap token SHALL be held in the secrets environment, SHALL NOT be rotated or deleted by the estate, and SHALL be renewed by its owner when it expires.

#### Scenario: Only the bootstrap token is made by hand

- **GIVEN** a Cloudflare credential a consumer of the estate uses
- **WHEN** the estate is read
- **THEN** the credential is an `AccountToken` resource in the program, or it is the bootstrap token
- **AND** no consumer holds a token made in the dashboard

### Requirement: A consumer holds one token with the least permission groups its calls need

Each consumer of a Cloudflare token SHALL hold one token, whose permission groups are the least its calls need. A consumer's token SHALL be widened by a change to its own token resource, and a change SHALL NOT widen another consumer's token to do it.

#### Scenario: A consumer's token is an AccountToken resource with one consumer

- **GIVEN** a consumer whose calls need a Cloudflare permission
- **WHEN** its token is declared
- **THEN** the token is an `AccountToken` resource that only that consumer's value reaches
- **AND** the consumer's permission groups are the groups its calls make

#### Scenario: A consumer needs one more permission group

- **GIVEN** a consumer whose calls need a permission group its token lacks
- **WHEN** the change is made
- **THEN** the group is added to that consumer's token resource in code
- **AND** no other consumer's token resource changes

### Requirement: A permission group is read by name, never by a hard-coded id

A token's permission groups SHALL be read from the Cloudflare provider's data source by each group's name, so a group's id is never written into the program.

#### Scenario: A permission group is read by name

- **GIVEN** a token resource that needs a permission group
- **WHEN** the resource is declared
- **THEN** the group's id comes from the permission-group data source, looked up by the group's name
- **AND** the program holds no literal permission-group id

### Requirement: A token is named by its responsibility under the convention

Each account token SHALL be named `<env>-tok-esposter-<responsibility>` when it belongs to one environment, and `tok-esposter-<responsibility>` when it belongs to the account, as the Cloudflare naming convention defines.

#### Scenario: A token name follows the convention

- **GIVEN** an `AccountToken` resource in the program
- **WHEN** its name is checked
- **THEN** the name is the convention's form for its scope
- **AND** a name outside the form fails the workspace tests

### Requirement: An environment's R2 key pair is derived from its token

Each environment's R2 publisher SHALL sign with an S3 key pair derived from its own token, the access key id being the token's id and the secret access key being the SHA-256 digest of the token's value. The pair SHALL reach ESC from the stack outputs and nowhere else.

#### Scenario: An environment's R2 pair is derived from its token

- **GIVEN** an environment's R2 publisher token scoped to that environment's buckets
- **WHEN** its S3 key pair is needed
- **THEN** the access key id is the token's id and the secret access key is the SHA-256 digest of its value
- **AND** the pair is written to the environment's ESC keys from the stack outputs, with no hand-made copy
