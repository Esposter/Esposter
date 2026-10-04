# Parity music scores

Each segment of the music's last `pnpm -C scripts genshin:parity listen`, our render against the game's own
sound. Pitch agreement runs from 0 to 1 (identical); each band's distance is the mean gap between the two's
levels in decibels, 0 identical, and the distance their mean; each band's bias is that gap signed, ours over
the game's, under 0 where ours is the quieter. Commit it with the change that moved it, as a bench's report is
committed.

| Screen | Segment | Pitch agreement | Distance | 63 Hz | 125 Hz | 250 Hz | 500 Hz | 1 kHz | 2 kHz | 4 kHz | 8 kHz |
| :----- | :------ | --------------: | -------: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `LoginMusic` | `435559168` | 0.884 | 5.4 dB | 7.0 | 5.1 | 4.7 | 4.2 | 4.9 | 5.9 | 5.6 | 5.9 |
| `LoginMusic` | `1041996604` | 0.815 | 6.6 dB | 7.0 | 5.2 | 4.6 | 5.6 | 6.3 | 7.1 | 7.8 | 9.0 |

| Screen | Segment | 63 Hz bias | 125 Hz bias | 250 Hz bias | 500 Hz bias | 1 kHz bias | 2 kHz bias | 4 kHz bias | 8 kHz bias |
| :----- | :------ | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `LoginMusic` | `435559168` | 5.6 | 2.3 | -2.6 | -1.0 | -1.4 | -1.7 | 1.7 | 0.5 |
| `LoginMusic` | `1041996604` | 3.5 | 3.6 | -1.1 | -3.7 | -1.1 | -0.7 | -0.0 | -4.5 |
