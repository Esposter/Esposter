## ADDED Requirements

### Requirement: A bench report groups each benchmarking test by its full name, fastest first

The benchmark reporter SHALL group each benchmarking test in a file by its full name, with the fastest task first, and SHALL leave out a test that recorded no benchmark.

#### Scenario: projects each benchmarking test into a group keyed by its full name, fastest task first

- **GIVEN** a file whose tests recorded benchmark results
- **WHEN** its report is built
- **THEN** each test is a group keyed by its full name, with its fastest task first

#### Scenario: names every group when one test ran more than one comparison

- **GIVEN** a test that ran more than one comparison
- **WHEN** its report is built
- **THEN** each of its groups is named

#### Scenario: omits tests that recorded no benchmarks

- **GIVEN** a test that recorded no benchmark
- **WHEN** the file's report is built
- **THEN** that test is left out of the report

### Requirement: A bench with no samples fails by name rather than writing an empty report

The benchmark reporter SHALL refuse a bench that produced no samples with an error that names the bench.

#### Scenario: throws a named error for a bench that produced no samples

- **GIVEN** a bench that produced no samples
- **WHEN** its report is built
- **THEN** the build fails with an error that names the bench

### Requirement: A Markdown report shows each group's multiplier against its baseline

The Markdown report SHALL show each group's multiplier against its baseline, which is the task named native when the group has one and otherwise its fastest task, with a multiplier above one meaning faster than the baseline and one below one meaning slower.

#### Scenario: derives the vs-base multiplier from the native baseline, faster above 1 and slower below

- **GIVEN** a group with a native baseline task
- **WHEN** the Markdown report is rendered
- **THEN** each other task's multiplier is shown against that baseline

### Requirement: A Markdown report records the host and the commit its numbers came from

The Markdown report SHALL open with an environment block that names the host and the commit, and SHALL show a section for each group.

#### Scenario: renders the environment block and a section per group

- **GIVEN** a report with groups and an environment
- **WHEN** the Markdown report is rendered
- **THEN** the environment block comes first and each group has its own section

### Requirement: A benchmark name with a pipe stays inside its table cell

The Markdown report SHALL escape the pipe delimiters in a benchmark name so the name stays in one table cell.

#### Scenario: escapes pipe delimiters in benchmark names

- **GIVEN** a benchmark whose name contains a pipe character
- **WHEN** the Markdown report is rendered
- **THEN** the pipe is escaped and the name stays in its cell
