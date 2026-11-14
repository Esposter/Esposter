# Schedules

Read when adding or changing a workflow's `schedule`.

Every cron in `.github/workflows` fires on **minute 16**, whatever its hour or day. The minute has to be off the
hour — GitHub's scheduler is shared, and its own documentation says a run is delayed under load, "high load times
include the start of every hour" — and once it is off the hour, one number for the whole repository beats a
different one per workflow: a schedule line is recognisable at a glance and nobody writing the next one has to
pick. Two schedules sharing the minute cost nothing, since a handful of runs of ours is not what congests a
scheduler the whole platform shares. Two _long_ jobs starting together is a real collision, and the hour is what
separates those.

The expression is quoted, because an unquoted one is a YAML scalar whose leading digits and `*`s read as luck
rather than as a decision, and it is UTC — the only zone GitHub reads. A comment gives the cadence and why that
cadence, never the local time it lands at, which daylight saving invalidates twice a year. A Cron Trigger (`crons` in `apps/functions/wrangler.jsonc`) reads the same five fields in UTC, so an expression copies across unchanged.
