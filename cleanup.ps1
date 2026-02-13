# Git cleanup script to remove Python version files
cd "c:\Users\arjun\OneDrive\Documents\AJ SYNAPSE"

# Show current status
Write-Host "Current git status:" -ForegroundColor Cyan
& git status --short

# Remove the problematic Python version files
Write-Host "`nRemoving Python version files..." -ForegroundColor Yellow
git rm --force .python-version 2>$null
git rm --force runtime.txt 2>$null

# Check status after removal
Write-Host "`nStatus after removal:" -ForegroundColor Cyan
& git status --short

# Commit the changes
Write-Host "`nCommitting deletions..." -ForegroundColor Yellow
git commit -m "Remove Python version files from root - frontend is Node.js only"

# Push to GitHub
Write-Host "`nPushing to GitHub..." -ForegroundColor Green
git push origin main

Write-Host "`nDone! Push successful. Vercel should automatically rebuild now." -ForegroundColor Green
