#!/bin/bash
# Script to clean up large files from git history
# WARNING: This rewrites git history. Make sure you have a backup!

set -e

echo "=========================================="
echo "Git Repository Cleanup Script"
echo "=========================================="
echo ""
echo "This script will:"
echo "1. Remove large files from git history"
echo "2. Clean up git references"
echo "3. Optimize the repository"
echo ""
echo "WARNING: This rewrites history. Make sure you:"
echo "- Have a backup of your repository"
echo "- Have pushed any important work"
echo "- Are ready to force-push after cleanup"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Aborted."
  exit 1
fi

# Large files to remove (from git history analysis)
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

echo ""
echo "Step 1: Removing large files from git history..."
echo "This may take a while..."

# Use git filter-repo if available, otherwise use filter-branch
if command -v git-filter-repo &> /dev/null; then
  echo "Using git-filter-repo (faster and safer)..."
  for file in "${LARGE_FILES[@]}"; do
    echo "  Removing: $file"
    git filter-repo --path "$file" --invert-paths --force
  done
else
  echo "Using git filter-branch (slower, but works without git-filter-repo)..."
  for file in "${LARGE_FILES[@]}"; do
    echo "  Removing: $file"
    git filter-branch --force --index-filter \
      "git rm --cached --ignore-unmatch '$file'" \
      --prune-empty --tag-name-filter cat -- --all 2>/dev/null || true
  done
  
  # Clean up filter-branch backups
  echo ""
  echo "Step 2: Cleaning up filter-branch backups..."
  git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin 2>/dev/null || true
fi

echo ""
echo "Step 3: Expiring reflog and running garbage collection..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "=========================================="
echo "Cleanup Complete!"
echo "=========================================="
echo ""
echo "New repository size:"
git count-objects -vH
echo ""
echo "Next steps:"
echo "1. Verify the repository works: git log, git status"
echo "2. If everything looks good, force push: git push --force --all"
echo "3. Also force push tags: git push --force --tags"
echo ""
echo "NOTE: All collaborators will need to re-clone the repository"

