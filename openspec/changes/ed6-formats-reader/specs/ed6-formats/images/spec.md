## ADDED Requirements

### Requirement: A hidden DDS reads as RGBA pixels

The reader SHALL turn an uncompressed 16- or 32-bit DDS into its width, its height and straight-alpha RGBA pixels, and refuse a DDS in any other pixel format.

#### Scenario: A 16-bit DDS reads as RGBA

- **GIVEN** a two-by-one DDS in 4444 ARGB whose pixels are opaque red and half-transparent blue
- **WHEN** it is read
- **THEN** the result is two pixels wide and one high
- **AND** its RGBA bytes are the opaque red and the half-transparent blue

#### Scenario: A block-compressed DDS is refused

- **GIVEN** a DDS whose pixel format is block-compressed
- **WHEN** it is read
- **THEN** the read fails with an error naming the pixel format

### Requirement: A raw sheet reads by its known format

The reader SHALL read a raw `._CH` sheet in the pixel format and width the caller gives or its format table lists, and refuse a sheet it has neither for, or whose length does not fill whole rows.

#### Scenario: A raw sheet reads in its listed format

- **GIVEN** a sheet whose name and length the format table lists as 1555 ARGB at a width of two
- **WHEN** it is read
- **THEN** the result is two pixels wide with each pixel decoded as 1555 ARGB

#### Scenario: A sheet with no known format is refused

- **GIVEN** a sheet the format table does not list and no format from the caller
- **WHEN** it is read
- **THEN** the read fails with an error saying the sheet's format is unknown

### Requirement: A chip sheet composes from its tiles

The reader SHALL compose a chip sheet from a `._CH` of 16-by-16 tiles and the `._CP` layout naming them, drawing a null tile as transparent and each frame below the one before.

#### Scenario: A chip layout draws its tiles

- **GIVEN** a tile sheet of two tiles and a layout of one frame naming the second tile, a null tile and the first
- **WHEN** the chip sheet is read
- **THEN** the frame shows the second tile, then a transparent square, then the first tile

#### Scenario: A layout naming a missing tile is refused

- **GIVEN** a layout naming a tile past the end of its tile sheet
- **WHEN** the chip sheet is read
- **THEN** the read fails with an error naming the missing tile

### Requirement: A font reads as grey glyph pixels

The reader SHALL read a `._DA` font of one grey byte per pixel at the glyph size its name gives, as RGBA pixels whose alpha is the grey value.

#### Scenario: A font's grey becomes alpha

- **GIVEN** an eight-pixel font whose first pixel is grey value 128
- **WHEN** it is read
- **THEN** the first pixel is white with alpha 128
