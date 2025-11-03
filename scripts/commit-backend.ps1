# Backend-only commit script
# Usage: .\scripts\commit-backend.ps1 -m "your commit message"

param(
    [Parameter(Mandatory=$true)]
    [string]$m
)

Write-Host "🚀 Committing backend changes only..." -ForegroundColor Cyan

# Stage only backend files
git add Auto_QA-backend/

# Check if there are any changes
$status = git status --short Auto_QA-backend/
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "❌ No backend changes to commit!" -ForegroundColor Red
    exit 1
}

# Commit with message
git commit -m $m -- Auto_QA-backend/

Write-Host "✅ Backend changes committed successfully!" -ForegroundColor Green
git log -1 --oneline

