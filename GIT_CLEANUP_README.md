# Git Repository Cleanup Guide

## Current Issues

1. **Repository Size: 602MB** - Too large due to large files in git history
2. **Large Files in History:**
   - 330MB: `images/archi2/architecture portfolio 8.png`
   - Multiple 67MB TIFF files (14 files)
   - 20MB: `images/conservation/c-02-1.png`
   - 19MB: `images/Solid-Knitting-Machine-1.gif`
   - 14MB: `images/YouTubeVideo0255-crop-1.gif`

3. **wine-bottle-flipbook-source node_modules** - Now properly ignored with `**/node_modules/` pattern

## Solutions Implemented

### 1. Updated .gitignore
- Added `**/node_modules/` to ignore node_modules in all subdirectories
- Added `*.tiff` and `*.tif` to prevent committing large TIFF files
- Added patterns for wine-bottle-flipbook-source build outputs

### 2. Cleanup Script
Created `cleanup-git-history.sh` to remove large files from git history.

## How to Clean Up Repository

### Option 1: Use the Cleanup Script (Recommended)

```bash
# Make sure you have a backup first!
git clone --mirror <your-repo-url> backup-repo.git

# Run the cleanup script
./cleanup-git-history.sh

# After cleanup, verify everything works
git log
git status

# Force push (WARNING: This rewrites history)
git push --force --all
git push --force --tags
```

### Option 2: Manual Cleanup (If script doesn't work)

```bash
# Remove specific large files from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch 'images/archi2/architecture portfolio 8.png'" \
  --prune-empty --tag-name-filter cat -- --all

# Clean up
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Option 3: Use Git LFS for Large Files (Future)

If you need to keep large files, use Git LFS:

```bash
# Install Git LFS
brew install git-lfs  # macOS
# or: apt-get install git-lfs  # Linux

# Initialize
git lfs install

# Track large files
git lfs track "*.gif"
git lfs track "*.png"
git lfs track "*.jpg"

git add .gitattributes
git commit -m "Add Git LFS tracking"
```

## Expected Results

After cleanup:
- Repository size should drop from **602MB to ~50-100MB**
- Git operations (push, pull, clone) will be much faster
- History will be cleaner

## Important Notes

⚠️ **WARNING**: Cleaning git history rewrites commits. This means:
- All commit hashes will change
- Collaborators must re-clone the repository
- You'll need to force-push: `git push --force --all`

## Verification

After cleanup, check the new size:
```bash
git count-objects -vH
du -sh .git
```

The size should be significantly smaller!

