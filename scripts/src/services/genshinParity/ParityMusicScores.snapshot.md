# Parity music scores

Each segment of the music's last `pnpm -C scripts genshin:parity listen`, our render against the game's own
sound. Pitch agreement runs from 0 to 1 (identical); each band's distance is the mean gap between the two's
levels in decibels, 0 identical, and the distance their mean; each band's bias is that gap signed, ours over
the game's, under 0 where ours is the quieter. Commit it with the change that moved it, as a bench's report is
committed.

| Screen | Segment | Pitch agreement | Distance | 63 Hz | 125 Hz | 250 Hz | 500 Hz | 1 kHz | 2 kHz | 4 kHz | 8 kHz |
| :----- | :------ | --------------: | -------: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `LoginMusic` | `435559168` | 0.884 | 8.0 dB | 9.1 | 8.1 | 4.9 | 5.9 | 7.9 | 9.5 | 10.1 | 8.5 |
| `LoginMusic` | `1041996604` | 0.815 | 7.0 dB | 6.9 | 5.6 | 4.3 | 6.4 | 7.2 | 7.9 | 8.2 | 9.4 |

| Screen | Segment | 63 Hz bias | 125 Hz bias | 250 Hz bias | 500 Hz bias | 1 kHz bias | 2 kHz bias | 4 kHz bias | 8 kHz bias |
| :----- | :------ | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `LoginMusic` | `435559168` | 7.1 | 3.8 | -1.1 | 0.5 | 0.2 | -0.2 | 3.2 | 2.0 |
| `LoginMusic` | `1041996604` | 3.6 | 3.7 | -1.1 | -3.7 | -1.1 | -0.6 | 0.0 | -4.5 |
