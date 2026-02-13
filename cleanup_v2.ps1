#!/usr/bin/env pwsh
$ErrorActionPreference = "Continue"

# Disable all pagers and editors
$env:GIT_EDITOR = "true"
$env:GIT_PAGER = ""
$env:PAGER = ""
$env:LESS = ""

# Go to repo
cd "c:\Users\arjun\OneDrive\Documents\AJ SYNAPSE"

# Show what files we're removing
Write-Host "=" * 50
Write-Host "CLEANUP: Removing Python version files"
Write-Host "=" * 50

# List files before removal
Write-Host "`n[1] Files to remove:"
Get-Item -Path ".python-version", "runtime.txt" -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "  - $($_.Name)" }

# Remove from git tracking
Write-Host "`n[2] Removing from git..."
git rm --force --cached .python-version 2>&1 | Out-Null
git rm --force --cached runtime.txt 2>&1 | Out-Null

# Remove from filesystem
Write-Host "[3] Removing files..."
Remove-Item -Force ".python-version" -ErrorAction SilentlyContinue -Verbose
Remove-Item -Force "runtime.txt" -ErrorAction SilentlyContinue -Verbose

# Verify removal
Write-Host "`n[4] Verification - remaining Python files:"
Get-Item -Path ".python-version", "runtime.txt" -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "  Still present: $($_.Name)" }
if (!((Test-Path ".python-version") -or (Test-Path "runtime.txt"))) {
    Write-Host "  ✓ All removed successfully"
}

# Commit with disabled pagers
Write-Host "`n[5] Committing to git..."
& git -c core.pager=cat -c core.editor=true commit -m "Remove Python version files from root directory" 2>&1 | Select-Object -Last 5

# Push with disabled pagers
Write-Host "`n[6] Pushing to GitHub..."
& git -c core.pager=cat push origin main 2>&1 | Select-Object -Last 10

Write-Host "`n" + ("=" * 50)
Write-Host "COMPLETE - Vercel rebuild should start automatically"
Write-Host "=" * 50
