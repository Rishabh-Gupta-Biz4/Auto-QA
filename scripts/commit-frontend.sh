#!/bin/bash
# Frontend-only commit script
# Usage: ./scripts/commit-frontend.sh "your commit message"

if [ -z "$1" ]; then
    echo "❌ Error: Commit message required"
    echo "Usage: ./scripts/commit-frontend.sh \"your commit message\""
    exit 1
fi

echo "🚀 Committing frontend changes only..."

# Stage only frontend files
git add Auto_QA-web/

# Check if there are any changes
if [ -z "$(git status --short Auto_QA-web/)" ]; then
    echo "❌ No frontend changes to commit!"
    exit 1
fi

# Commit with message
git commit -m "$1" -- Auto_QA-web/

echo "✅ Frontend changes committed successfully!"
git log -1 --oneline

