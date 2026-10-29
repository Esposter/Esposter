# The dump

Read when a table, text map or `Readable` folder is missing from the dump, or a book body is published.

The one-line rule is in `SKILL.md`; this page is its reasoning.

## Book bodies

**A book's body is read from `Readable/`, not a text map**: the body's text is not in `TextMap`, so `genshin:assets archive` reads it from the dump's `Readable/<code>/` folder, named by the localization row its document's quest text id points at, and publishes it to the hosted game data as one index per language, `bookBody/<language>`, keyed by body id, which `readGameDataEntry` reads when a volume opens (`openspec/specs/genshin/hosted-game-data/design.md`).

## Fetching the dump

The readers only read the dump.

**A table the dump lacks is fetched, never committed**: `genshin:text fetch` downloads from `DimbreathBot/AnimeGameData`'s `ExcelBinOutput/` and `TextMap/`, every talent config, the binary of each quest the reader carries (its main quest's, fetched once the tables are down), and the other `BinOutput/` files the dump already holds (the `main` branch, `raw.githubusercontent.com`, each directory listed whole through the Git Trees API, authorized by `GITHUB_TOKEN` when one is set) every table, text map and binary the dump lacks or holds with content other than `main`'s (compared by the git blob SHA the listing gives, never by size: a table whose hashes change digits keeps its size, and a size check kept such tables from an older build beside a newer text map), whether a reader names it or not, into the dump beside the others, outside the repository.
