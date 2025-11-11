#!/bin/bash
# Sync script: fetch, commit changes, and push

echo "Fetching latest changes..."
git fetch

echo ""
echo "Current status:"
git status

echo ""
if [ -n "$(git status --porcelain)" ]; then
    echo "Staging all changes..."
    git add -A
    
    echo "Committing changes..."
    git commit -m "Update files"
    
    echo "Pushing to remote..."
    git push
    echo "✓ Done! Changes committed and pushed."
else
    echo "No local changes to commit."
    echo "Pulling latest changes from remote..."
    git pull
    echo "✓ Up to date!"
fi

