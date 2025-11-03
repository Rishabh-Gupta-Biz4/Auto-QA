#!/bin/bash
# Backend-only commit script
# Usage: ./scripts/commit-backend.sh "your commit message"

if [ -z "$1" ]; then
    echo "❌ Error: Commit message required"
    echo "Usage: ./scripts/commit-backend.sh \"your commit message\""
    exit 1
fi

echo "🚀 Committing backend changes only..."

# Stage only backend files
git add Auto_QA-backend/

# Check if there are any changes
if [ -z "$(git status --short Auto_QA-backend/)" ]; then
    echo "❌ No backend changes to commit!"
    exit 1
fi

# Commit with message
git commit -m "$1" -- Auto_QA-backend/

echo "✅ Backend changes committed successfully!"
git log -1 --oneline

