## 1. Area templates

- [x] 1.1 Add the weather templates table to the game text dump's fetched tables and fetch it. Verify: `pnpm -C scripts genshin:text fetch` completes with WeatherExcelConfigData among the tables it writes. Done without a new entry: the fetch lists every ExcelBinOutput table and keeps each held copy whose size matches, and both weather tables are held at the remote size (WeatherExcelConfigData 584385 bytes, WeatherTemplateExcelConfigData 18512 bytes). The fetch itself was not re-run, since it rewrites the shared dump.
- [ ] 1.2 Give each catalogue area the template of the weather area covering it, with an area whose template is not the standard one turning by its own rows. Verify: a test named after the scenario 'An area with its own template turns by its own rows'.

## 2. Standard and city chains

- [x] 2.1 Keep the standard chain and the city chain as the game reads them. Verify: tests named after 'Rain always turns to clear or cloudy at the next change' and 'A city's weather never turns to rain'.
