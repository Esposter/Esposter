## Purpose

A reply's spoken lines — the blockquote lines the output style confines the character to — handed by the plugin's hooks module on the MessageDisplay event to a resident synthesizer on this machine as each is written and read in the character's own cloned voice through Chatterbox on the first device that speaks; the voice verb that installs the engine into the plugin's state directory; and the gates that keep a machine without one, or a session that would hear nothing, from doing the work at all.

## Requirements

### Requirement: Only the blockquote lines of a reply are spoken

A reply's spoken lines SHALL be its blockquote lines, and no other part of a reply SHALL be spoken.

#### Scenario: Reply with spoken lines and a plain answer

- **GIVEN** a reply contains blockquote lines and a plain answer
- **WHEN** the reply is displayed
- **THEN** only the blockquote lines are spoken
- **AND** the plain answer is shown on screen only

### Requirement: Spoken lines are read in the character's own voice on this machine

Each spoken line SHALL be read in the character's own cloned voice by an engine running on this machine, with no service behind it.

#### Scenario: Piece of a reply arrives for reading

- **GIVEN** a voice is set up for the session's character
- **WHEN** a piece with spoken lines is displayed
- **THEN** the lines are read by the resident engine in the character's voice

### Requirement: Pieces of a message are read in written order

A message's pieces SHALL be read in the order they were written, and a newer reply SHALL replace an older reply that is still waiting.

#### Scenario: Piece arrives before its predecessor

- **GIVEN** a message's second piece has arrived before its first
- **WHEN** the pieces are read
- **THEN** the second piece waits until the first has been read

#### Scenario: Newer reply replaces the older one

- **GIVEN** a reply is being read
- **WHEN** a newer reply arrives
- **THEN** the older reply's remaining waiting lines are dropped
- **AND** the reading under way stops at the line it has reached

### Requirement: A missing piece does not hold the reply indefinitely

A piece that never arrives SHALL hold the pieces after it for no longer than the hook's own timeout.

#### Scenario: Piece never arrives

- **GIVEN** a piece's hook was stopped before it could send
- **WHEN** the pieces after it are waiting
- **THEN** they are read once the hook's timeout has passed

### Requirement: First sound starts after one chunk of speech

A line's first sound SHALL start one chunk after its speech begins, rather than after the whole line is synthesized.

#### Scenario: Long line read aloud

- **GIVEN** a spoken line is longer than one chunk of speech
- **WHEN** the line is read
- **THEN** its first sound plays after its first chunk is ready
- **AND** the rest of the line follows without a click at the joins

### Requirement: Audio that is not speech moves the engine down a device

An audio chunk that does not sound like speech SHALL NOT be played, SHALL move the engine one device step down, and SHALL drop the rest of that line.

#### Scenario: Chunk fails the speech check

- **GIVEN** a chunk of a line is near silence
- **WHEN** the chunk is checked
- **THEN** the chunk is not played
- **AND** the engine moves one device step down
- **AND** the rest of that line is dropped

#### Scenario: Next line on the lower device

- **GIVEN** the engine has moved down after a failed chunk
- **WHEN** the next line is read
- **THEN** it is read on the lower device

#### Scenario: Failure on a non-GPU provider

- **GIVEN** a synthesis fails on a provider other than the GPU
- **WHEN** the failure is raised
- **THEN** that line is dropped
- **AND** the device step is kept

### Requirement: Spoken replies are skipped when there is no voice or nothing would be heard

Spoken replies SHALL be skipped, before any engine starts, when no voice is set up, when the session is muted, or when the volume is zero.

#### Scenario: Session muted

- **GIVEN** a voice is set up and the session is muted
- **WHEN** a piece is displayed
- **THEN** no piece is sent to the synthesizer
- **AND** no engine is woken

#### Scenario: Volume set to zero

- **GIVEN** a voice is set up and the volume is zero
- **WHEN** a piece is displayed
- **THEN** no piece is sent to the synthesizer

### Requirement: Session start warms the engine when speech would be heard

The session start SHALL warm the engine for the session's character when a voice is set up and would be heard, and SHALL keep nothing from the warm.

#### Scenario: Warm at session start

- **GIVEN** a voice is set up and would be heard
- **WHEN** a session starts
- **THEN** one short word is synthesized for the character
- **AND** nothing from it is kept

#### Scenario: Synthesizer cannot bind

- **GIVEN** the synthesizer cannot bind its address
- **WHEN** a session starts
- **THEN** the session start is not delayed beyond the bind attempt

### Requirement: Voice verb installs the engine and writes the dub last

The voice verb SHALL install the engine and its weights into the plugin's state directory and SHALL write the dub file last, so that replies are spoken only once the voice has answered.

#### Scenario: Voice set up successfully

- **GIVEN** a dub is named to the voice verb
- **WHEN** the synthesizer answers the proof sentence
- **THEN** the dub file is written
- **AND** replies from the next reply on are spoken

#### Scenario: Synthesizer does not answer the proof

- **GIVEN** a dub is named to the voice verb
- **WHEN** the synthesizer does not answer the warm
- **THEN** no dub file is written
- **AND** replies stay silent

### Requirement: Teardown removes the voice and keeps the persona

The teardown verb SHALL remove the engine, the weights, the references, the dub, the device record and the log, and SHALL keep the pick records and the pin.

#### Scenario: Teardown with a running synthesizer

- **GIVEN** a synthesizer is running
- **WHEN** teardown runs
- **THEN** the synthesizer is stopped first
- **AND** the voice files are removed
- **AND** the pick records and the pin are kept

### Requirement: A synthesizer that cannot load reports why and stays silent

A synthesizer that cannot load the engine SHALL write the reason to the log, and every later reply SHALL stay silent.

#### Scenario: Engine fails to load

- **GIVEN** the engine's weights are corrupt
- **WHEN** a reply is displayed
- **THEN** the reason is written to the log
- **AND** the reply is not spoken

### Requirement: A failed player does not fail the request

A player that does not play SHALL have its reason logged, and the request SHALL still be answered as synthesized.

#### Scenario: Player refuses the file

- **GIVEN** the player refuses the audio file
- **WHEN** the line is played
- **THEN** the reason is logged
- **AND** the request is answered as successful

### Requirement: Only English-script lines are sent

A line with no Latin letter, or with a letter of another script in it, SHALL NOT be sent to the synthesizer, and that line alone SHALL be skipped.

#### Scenario: Japanese line inside an English reply

- **GIVEN** an English reply contains one line in Japanese
- **WHEN** the reply is spoken
- **THEN** the Japanese line is skipped
- **AND** the English lines are read

### Requirement: Audio is never shipped

The plugin SHALL ship no game audio, and reference clips SHALL be fetched to this machine and kept only in the state directory.

#### Scenario: Reference clip first used

- **GIVEN** a character's reference clip is not on this machine
- **WHEN** it is first needed
- **THEN** it is fetched and kept under the state directory only

### Requirement: Synthesizer exits when idle

The resident synthesizer SHALL exit when it has been idle past its timeout, freeing the graphics device.

#### Scenario: Idle timeout reached

- **GIVEN** the synthesizer has had no request for its timeout
- **WHEN** the timeout passes
- **THEN** the synthesizer exits
