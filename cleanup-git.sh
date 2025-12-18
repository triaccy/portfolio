#!/bin/bash
# Script to clean up large files from git history

echo "Cleaning up large files from git history..."
echo "This will rewrite git history - make sure you have a backup!"

# List of large files to remove from history
LARGE_FILES=(
  "images/archi2/architecture portfolio 8.png"
  "images/archi2/architecture portfolio-11 (dragged).tiff"
  "images/archi2/architecture portfolio-6 (dragged).tiff"
  "images/archi2/architecture portfolio-9 (dragged).tiff"
  "images/archi 3/architecture portfolio-14 (dragged).tiff"
  "images/archi 3/architecture portfolio-15 (dragged).tiff"
  "images/archi2/architecture portfolio-8 (dragged).tiff"
  "images/archi 3/architecture portfolio-13 (dragged).tiff"
  "images/archi2/architecture portfolio-5 (dragged).tiff"
  "images/archi2/architecture portfolio-7 (dragged).tiff"
  "images/archi 3/architecture portfolio-12 (dragged).tiff"
  "images/archi2/architecture portfolio-4 (dragged).tiff"
  "images/archi2/architecture portfolio-10 (dragged).tiff"
  "images/archi2/architecture portfolio-2 (dragged).tiff"
)

# Remove files from git history using git filter-branch
for file in "${LARGE_FILES[@]}"; do
  echo "Removing $file from git history..."
  git filter-branch --force --index-filter \
    "git rm --cached --ignore-unmatch '$file'" \
    --prune-empty --tag-name-filter cat -- --all
done

# Clean up refs
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "Cleanup complete! Repository size should be much smaller now."
echo "Run 'git count-objects -vH' to check the new size."

