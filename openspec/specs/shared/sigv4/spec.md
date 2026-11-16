## Purpose

SigV4 signing in @esposter/shared — the signer the Worker, the tooling and the file pack use for R2's S3 API, and the absorption of aws4fetch it replaces, with every upstream issue's verdict.

## Requirements

### Requirement: A signature matches AWS's published examples

The signer SHALL produce the signatures AWS publishes for its S3 SigV4 examples.

#### Scenario: AWS's presigned GET example

- **GIVEN** AWS's example credentials, bucket, key and signing time, and a lifetime of one day
- **WHEN** a caller presigns a GET of the key
- **THEN** the URL carries the signature AWS publishes for that example

#### Scenario: AWS's header-signed GET with a range

- **GIVEN** AWS's example credentials and signing time, a `Range` header and the empty payload's hash
- **WHEN** a caller signs a GET of the key
- **THEN** the `Authorization` header carries the signature AWS publishes, with `range` among the signed headers

### Requirement: Every header the caller passes is signed

The signer SHALL sign every header the request carries and the host, so the request must send each with the value it was signed with.

#### Scenario: A presigned PUT whose upload sends another type is refused

- **GIVEN** a PUT presigned with a `Content-Type`
- **WHEN** the upload sends a different `Content-Type`
- **THEN** R2 refuses it

### Requirement: A presigned URL is sent as it was signed

The presigned URL's query SHALL be written in the encoding it was signed in.

#### Scenario: A download name with a space

- **GIVEN** a GET presigned with a `response-content-disposition` whose filename holds a space and a star
- **WHEN** the URL is fetched
- **THEN** R2 answers it and returns that disposition

### Requirement: A refused request is sent again only when it can be

The signed fetch SHALL send a request answered 5xx or 429 again, signed afresh, up to its retry count, and SHALL send a request with a streamed body once.

#### Scenario: A refusal and then an answer

- **GIVEN** a request answered 503, then 429, then 200
- **WHEN** a caller sends it
- **THEN** it resolves to the 200 after three attempts

#### Scenario: A streamed body

- **GIVEN** a request with a streamed body answered 503
- **WHEN** a caller sends it
- **THEN** it resolves to the 503 after one attempt
