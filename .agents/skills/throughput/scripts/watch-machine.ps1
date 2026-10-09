# Watches the machine for the main session: prints one line when the CPU has sat under its target while memory has room
# For more runs, or when free memory falls under the gate; silent while the machine is busy and safe
# Run it under the Monitor tool, so each printed line wakes the session
param(
  [int]$TargetPercentage = 80,
  [int]$WindowMinutes = 3,
  [double]$GateGigabytes = 4,
  [double]$RoomGigabytes = 6,
  [int]$ReminderMinutes = 15,
  [string[]]$OrphanScanNames = @("find.exe", "du.exe", "grep.exe", "rg.exe"),
  [int]$OrphanCpuSeconds = 30
)

$cpuSamples = [System.Collections.Generic.Queue[double]]::new()
$lastState = ""
$minutesInState = 0

while ($true) {
  $cpu = (Get-Counter '\Processor(_Total)\% Processor Time' -SampleInterval 60 -MaxSamples 1).CounterSamples[0].CookedValue
  $cpuSamples.Enqueue($cpu)
  while ($cpuSamples.Count -gt $WindowMinutes) { [void]$cpuSamples.Dequeue() }
  $cpuAverage = ($cpuSamples | Measure-Object -Average).Average
  $freeGigabytes = (Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1MB
  $gpuSamples = (Get-Counter '\GPU Engine(*engtype_3D)\Utilization Percentage' -ErrorAction SilentlyContinue).CounterSamples
  $gpu = ($gpuSamples | Measure-Object CookedValue -Sum).Sum

  $state = if ($freeGigabytes -lt $GateGigabytes) { "tight" }
    elseif ($cpuSamples.Count -ge $WindowMinutes -and $cpuAverage -lt $TargetPercentage -and $freeGigabytes -gt $RoomGigabytes) { "idle" }
    else { "busy" }
  $minutesInState = if ($state -eq $lastState) { $minutesInState + 1 } else { 0 }

  # A search or size scan whose parent is gone has no reader left, so it is stopped the minute it is seen: an agent that
  # Ended mid-scan left a `find /` running for half an hour on 2026-10-09
  $processes = Get-CimInstance Win32_Process
  $processIds = [System.Collections.Generic.HashSet[uint32]]::new([uint32[]]@($processes.ProcessId))
  $orphans = $processes | Where-Object { $_.Name -in $OrphanScanNames -and -not $processIds.Contains($_.ParentProcessId) } |
    Where-Object { (Get-Process -Id $_.ProcessId -ErrorAction SilentlyContinue).CPU -gt $OrphanCpuSeconds }
  foreach ($orphan in $orphans) {
    Stop-Process -Id $orphan.ProcessId -Force -ErrorAction SilentlyContinue
    Write-Output ("swept orphan {0} {1}: {2}" -f $orphan.Name, $orphan.ProcessId, $orphan.CommandLine.Substring(0, [Math]::Min(120, $orphan.CommandLine.Length)))
  }

  $figures = "CPU {0:N0}% over {1} min, GPU 3D {2:N0}%, {3:N1} GB free" -f $cpuAverage, $cpuSamples.Count, $gpu, $freeGigabytes
  if ($state -ne $lastState -or ($state -ne "busy" -and $minutesInState -gt 0 -and $minutesInState % $ReminderMinutes -eq 0)) {
    switch ($state) {
      "idle" { Write-Output "machine idle: $figures - room for more runs" }
      "tight" { Write-Output "machine tight: $figures - hold new runs" }
      "busy" { if ($lastState) { Write-Output "machine busy: $figures" } }
    }
  }
  $lastState = $state
}
