# Setup Guide for kTracker Repository

## Repository Created ✅

**Repository URL:** https://github.com/bigknoxy/ktracker

**Branches Pushed:**
- `master` - Main branch (set as default)
- `ktracker` - Development branch

**CI/CD:**
- Basic CI workflow added at `.github/workflows/ci.yml`
- Runs on all pull requests to `master`
- Checks: Bun setup, Node.js setup, install dependencies, type check backend, build frontend

## What You Need to Do (Manual Setup)

### 1. Set Up Branch Protection Rules

The branch protection requires manual setup via GitHub UI. Follow these steps:

1. **Go to Repository Settings:**
   - Visit: https://github.com/bigknoxy/ktracker/settings/branches

2. **Edit `master` Branch Protection:**
   - Find the "master" branch
   - Click "Edit" or "Add rule"

3. **Configure These Settings:**
   ✅ **Require a pull request before merging**
      - Check "Require pull request reviews before merging"
      - Set "Require approval" to: **1**
      - **Uncheck** "Dismiss stale reviews"
      - **Uncheck** "Require review from CODE OWNERS"

   ✅ **Require status checks to pass before merging**
      - Check "Require status checks to pass before merging"
      - Make it **Strict** (ensure up-to-date)
      - Required checks: `CI`
      - Wait for: `1` check to pass

   ✅ **Restrict who can push to this branch**
      - Check "Restrict who can push"
      - Add `bigknoxy` (you) to allowed users
      - This ensures only PRs can merge, not direct pushes

   ✅ **Do not allow bypassing the above settings**
      - **Uncheck** "Allow administrators to bypass settings"
      - This ensures YOU must also use PRs

4. **Save Changes**

### 2. Verify Branch Protection

After setting up:
1. Try to push directly to master: `git push origin master`
2. You should see an error like:
   ```
   remote: error: GH006: Protected branch update failed for refs/heads/master.
   remote: error: Branch protection rules require pull request.
   ```
3. This means branch protection is working correctly!

## Development Workflow

### For New Features:

```bash
# 1. Create a feature branch from ktracker
git checkout ktracker
git pull origin ktracker
git checkout -b feature/your-feature-name

# 2. Make your changes
# ... edit files ...

# 3. Commit changes
git add .
git commit -m "feat: your feature description"

# 4. Push to your feature branch
git push origin feature/your-feature-name

# 5. Create a Pull Request
# Visit: https://github.com/bigknoxy/ktracker/compare/master...feature/your-feature-name
# OR use: gh pr create --base master --head feature/your-feature-name
```

### To Merge Changes into Master:

```bash
# 1. Create a Pull Request from ktracker to master
# Visit: https://github.com/bigknoxy/ktracker/compare/master...ktracker
# OR use: gh pr create --base master --head ktracker

# 2. Wait for CI to pass
# Check the "Checks" tab on the PR

# 3. You approve and merge
# Since only you (bigknoxy) can approve, you'll:
# - Review your own PR
# - Approve it
# - Merge it (squash merge recommended)

# 4. Delete the branch after merge
git branch -d feature/your-feature-name
```

## Branch Strategy

- **`master`** - Production branch
  - Protected: ✅ (once you configure)
  - Direct pushes: Blocked ✅
  - Merge method: Pull requests only
  - Requires: 1 approval from bigknoxy
  - Requires: CI checks to pass

- **`ktracker`** - Development branch
  - Protected: ❌
  - Direct pushes: Allowed
  - Used for: Daily development work

- **`feature/*`** - Feature branches
  - Created from: `ktracker`
  - Merged into: `master` via PR
  - Deleted after: Merge

## Quick Reference

```bash
# Sync local branches with remote
git fetch --all

# Create new feature from ktracker
git checkout ktracker && git pull && git checkout -b feature/new-feature

# Push feature branch
git push origin feature/new-feature

# Create PR from CLI
gh pr create --base master --head feature/new-feature --title "Feature description"

# View all open PRs
gh pr list

# Merge PR via CLI (once you approve)
gh pr merge --squash <pr-number>

# List all branches
git branch -a
```

## Testing the Setup

1. **Test Branch Protection:**
   ```bash
   # Try to push to master directly (should fail)
   git checkout master
   echo "test" >> test.txt
   git add test.txt && git commit -m "test direct push"
   git push origin master
   ```
   Expected: Error about protected branch

2. **Test CI:**
   ```bash
   # Create a test PR
   git checkout -b test/ci-check
   # Make a small change, commit, and push
   gh pr create --base master --head test/ci-check
   ```
   Expected: CI workflow runs and passes

3. **Test Approval Flow:**
   - Open PR
   - Wait for CI to pass
   - You must approve it
   - Then you can merge

## Important Notes

- ⚠️ **Never push directly to `master` after branch protection is enabled**
- ✅ **Always create feature branches from `ktracker`**
- ✅ **All changes to `master` must come via Pull Request**
- ✅ **CI must pass before PR can be merged**
- ✅ **You (bigknoxy) must approve PRs before merging**
- 🔄 **Use `ktracker` as your daily development branch**
- 🗑️ **Delete merged feature branches**

## Repository URL

**Public Repo:** https://github.com/bigknoxy/ktracker

**Settings:** https://github.com/bigknoxy/ktracker/settings

**Branch Protection:** https://github.com/bigknoxy/ktracker/settings/branches

**Actions (CI):** https://github.com/bigknoxy/ktracker/actions
