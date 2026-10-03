# Parity music scores

Each segment of the music's last `pnpm -C scripts genshin:parity listen`, our render against the game's own
sound. Pitch agreement runs from 0 to 1 (identical); each band's distance is the mean gap between the two's
levels in decibels, 0 identical, and the distance their mean. Commit it with the change that moved it, as a
bench's report is committed.

| Screen | Segment | Pitch agreement | Distance | 63 Hz | 125 Hz | 250 Hz | 500 Hz | 1 kHz | 2 kHz | 4 kHz | 8 kHz |
| :----- | :------ | --------------: | -------: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `LoginMusic` | `435559168` | 0.866 | 11.8 dB | 8.0 | 7.4 | 5.8 | 7.5 | 10.3 | 13.5 | 16.3 | 26.0 |
| `LoginMusic` | `1041996604` | 0.797 | 11.5 dB | 17.2 | 6.0 | 5.2 | 8.6 | 8.7 | 10.6 | 14.0 | 21.8 |
