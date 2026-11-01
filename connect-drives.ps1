# Run in the same non-elevated Windows user session as Node.
$ErrorActionPreference = 'Stop'
$configJson = & node "$PSScriptRoot\config.js"
if ($LASTEXITCODE -ne 0) { exit 2 }
$config = ($configJson -join [Environment]::NewLine) | ConvertFrom-Json
$drives = @($config.drives)
$missing = @()

function Get-ExistingMapping([string]$letter) {
    # Query all mappings so an absent letter is not treated as a cmdlet error.
    $all = @(Get-SmbMapping -ErrorAction Stop)
    return $all | Where-Object { $_.LocalPath -ieq $letter } | Select-Object -First 1
}

try {
    for ($index = 0; $index -lt $drives.Count; $index++) {
        $letter = $drives[$index] + ':'
        $hostName = $config.hostPrefix + ($index + 1)
        $remote = '\\' + $hostName + '\' + $config.share
        $first = $index * 2 + 1
        Write-Host ""
        Write-Host "$letter -> $remote (baner $first og $($first + 1))"
        $conflict = $false
        $ready = $false

        for ($attempt = 1; $attempt -le 3; $attempt++) {
            $mapping = Get-ExistingMapping $letter
            if ($mapping -and $mapping.RemotePath.TrimEnd([char]92) -ine $remote) {
                Write-Warning "$letter peker allerede til $($mapping.RemotePath). Beholdes urort. Forventet $remote."
                $conflict = $true
                break
            }
            if (-not $mapping) {
                if (Get-PSDrive -Name $drives[$index] -ErrorAction SilentlyContinue) {
                    Write-Warning "$letter er opptatt av en annen disk. Beholdes urort."
                    $conflict = $true
                    break
                }
                Write-Host "Kobler til, forsok $attempt av 3 ..."
                # Windows PowerShell may turn native stderr into terminating errors.
                $ErrorActionPreference = 'Continue'
                $output = & net.exe use $letter $remote $config.password "/user:$($config.username)" /persistent:no 2>&1
                $result = $LASTEXITCODE
                $ErrorActionPreference = 'Stop'
                # Recheck: another startup may have established the mapping meanwhile.
                $mapping = Get-ExistingMapping $letter
                if ($result -ne 0 -and -not ($mapping -and $mapping.RemotePath -ieq $remote)) {
                    Write-Warning ($output -join [Environment]::NewLine)
                }
                if ($mapping -and $mapping.RemotePath -ine $remote) {
                    Write-Warning "$letter ble koblet til $($mapping.RemotePath) av en annen prosess. Beholdes urort."
                    $conflict = $true
                    break
                }
            } elseif ($attempt -eq 1) {
                Write-Host 'Gjenbruker eksisterende riktig tilkobling.'
            }
            $filesReady = $true
            foreach ($lane in @($first, ($first + 1))) {
                $file = Join-Path ($letter + '\') (Join-Path $config.imageDir ('VTVFile' + $lane + '.jpg'))
                if (-not (Test-Path -LiteralPath $file -PathType Leaf -ErrorAction SilentlyContinue)) { $filesReady = $false }
            }
            if ($mapping -and $filesReady) { $ready = $true; break }
            if ($attempt -lt 3) { Write-Host 'Venter 2 sekunder og prover igjen ...'; Start-Sleep -Seconds 2 }
        }

        if (-not $ready -and -not $conflict) {
            try {
                $addresses = [System.Net.Dns]::GetHostAddresses($hostName)
                Write-Host ("Navneoppslag: {0} -> {1}" -f $hostName, (($addresses | ForEach-Object { $_.IPAddressToString }) -join ', '))
                Write-Warning "Kontroller tilgang til $remote og at bildefilene finnes. Test ved behov: Test-NetConnection $hostName -Port 445"
            } catch {
                Write-Warning "Navneoppslag feilet for $hostName. Sammenlign IP-adresse med en fungerende PC. Ingen IP-adresse er gjettet eller endret."
            }
        }
        foreach ($lane in @($first, ($first + 1))) {
            $file = Join-Path ($letter + '\') (Join-Path $config.imageDir ('VTVFile' + $lane + '.jpg'))
            if (-not $conflict -and (Test-Path -LiteralPath $file -PathType Leaf -ErrorAction SilentlyContinue)) {
                Write-Host "OK: Bane $lane - $file"
            } else {
                $missing += $lane
                Write-Warning "Bane $lane utilgjengelig eller feil disktilkobling: $file"
            }
        }
    }
} catch {
    Write-Warning "Nettverkskontrollen kunne ikke fullfores: $($_.Exception.Message)"
    Write-Warning 'Ingen eksisterende tilkoblinger er slettet. Kjor net use for a kontrollere dem.'
    exit 2
}
Write-Host ""
if ($missing.Count) {
    Write-Warning ("Utilgjengelige baner: " + ($missing -join ', ') + '. Visningen starter likevel og prover bildene igjen hvert 5. sekund.')
    exit 1
}
Write-Host 'Alle 16 baner er tilgjengelige.'
exit 0
