# Frontend-only commit script
# Usage: .\scripts\commit-frontend.ps1 -m "your commit message"

param(
    [Parameter(Mandatory=$true)]
    [string]$m
)

Write-Host "🚀 Committing frontend changes only..." -ForegroundColor Cyan

# Stage only frontend files
git add Auto_QA-web/

# Check if there are any changes
$status = git status --short Auto_QA-web/
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "❌ No frontend changes to commit!" -ForegroundColor Red
    exit 1
}

# Commit with message
git commit -m $m -- Auto_QA-web/

Write-Host "✅ Frontend changes committed successfully!" -ForegroundColor Green
git log -1 --oneline

