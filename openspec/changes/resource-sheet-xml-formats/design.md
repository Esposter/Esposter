## Context

A sheet format is one entry of the sheet's configuration map, which carries the file extension, the mime type, a settings schema and a codec pair. JSON is the nearest model: its import reads an array of objects, takes the columns as every key in first-seen order, and keeps each cell as the text it was written as, and its export writes the columns back as keys. The import and export submenus list the map's formats, so a new entry appears in both.

## Decisions

- **The document is rows of cells.** The root holds repeated row elements, and each row holds one element per cell. The import takes the root's first repeated child name as the row name, so `<rows><row>…` and `<people><person>…` read alike. The alternative was a fixed schema with a mandatory root and row name, which refuses most XML an owner actually has.
- **A cell is read by its element name, or by a name attribute.** An element whose name is a valid column name is read as that column, and an element named `cell` with a `name` attribute is read as the column the attribute names. The export writes the second form only for a column whose name is not a valid XML name, such as a name with a space or a leading digit, so a column name always survives a round trip. The alternative was escaping the name into the element, which changes the name a reader sees.
- **A cell is text.** Every cell keeps the text it was written as, as JSON's import does, so the existing type inference decides what a column is. The alternative was reading attribute and element types from the XML, which most files do not carry.
- **Attributes on a row become columns after its elements.** A row's attributes read as cells in attribute order, so an id carried as an attribute is not lost. The alternative was to ignore attributes, which drops the key of most record-style XML.
- **A document with a doctype is refused.** The import parses with the browser's own parser, which does not fetch external entities, and a document that declares a doctype is refused anyway, since an internal entity can expand a small file into a large one. The alternative was to accept it and rely on the parser's limits.
- **A malformed document is refused with the parser's message.** The parser reports an error as a document of its own, which the import detects and raises as the file's read error, so the alert names the file and the line.
- **The codec is built on the browser's parser and serializer, with no library.** Both are in every browser the app targets, so the format adds no bundle weight, which is why it is unlike XLSX and needs no lazy import.

## Rejected

- A library for XML, since the browser's parser reads and writes the document and a library would ship a second one.
- Nested elements read as nested columns, since a sheet is flat and a flattening rule is a second model to document and test. A row child that has children of its own is refused with a message naming the element.
- XML for the other resources. A todo list or a blueprint has a document model of its own, and an XML form of each is a separate decision.

## Risks and trade-offs

- A file with mixed content, text beside child elements in one cell, is read as the cell's text content, which concatenates the pieces. The import counts such cells and reports it in the preview.
- A very large file is held to the same content size limit as every import, since the parser holds the whole document.
