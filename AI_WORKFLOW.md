# AI WORKFLOW - TH-LOTTO Admin Panel

## 🚨 MANDATORY RULES FOR ALL AI AGENTS

### 1. BEFORE ANY WORK - READ THESE FILES FIRST
- **PROJECT_GUIDE.md** - Project protection rules and structure
- **PROJECT_STATUS.md** - Current version, features, deployment status
- **CHANGELOG.md** - Version history and recent changes
- **AGENT_HANDOFF.md** - All URLs, architecture, known bugs

### 2. SOURCE OF TRUTH
- **GitHub Repository**: https://github.com/thlotto3239-star/TH-LOTTO-Admin-push (branch: master)
- **Live Domain**: https://th-lotto-admin.vercel.app
- **Vercel Project ID**: prj_Un7pZtGDhtaxXOGaOXDajtLDpPWM
- **Vercel Team ID**: team_babk9xu2M3DdrIMngeAMj154
- **Local Path**: c:\Users\armyn\Downloads\thlotto-admin (NOT the current workspace)

### 3. FORBIDDEN ACTIONS
- ❌ NEVER reference or edit local files as source of truth
- ❌ NEVER deploy to other domains
- ❌ NEVER create new Vercel projects
- ❌ NEVER change auth flow (SHA256)
- ❌ NEVER delete DB schema without checking references
- ❌ NEVER skip documentation updates
- ❌ NEVER rewrite functions without preserving original field names/logic
- ❌ NEVER assume - ALWAYS verify from GitHub/Vercel API

---

## 📋 STANDARD WORKFLOW FOR ALL AI AGENTS

### STEP 1: INITIAL ANALYSIS (MANDATORY)
1. **Read PROJECT_GUIDE.md, PROJECT_STATUS.md, CHANGELOG.md** - Understand current state
2. **Check current deployment status** via Vercel API:
   - Get current deployment: `mcp0_get_deployment` for `th-lotto-admin.vercel.app`
   - Check deployment state and commit SHA
3. **Check GitHub commit history** to understand what was done:
   - List recent deployments: `mcp0_list_deployments`
   - Read commit messages to understand changes
4. **Verify deployment is working**:
   - Fetch live URL: `mcp0_web_fetch_vercel_url` for `th-lotto-admin.vercel.app`
   - Check HTTP status (should be 200)
   - Check for runtime errors: `mcp0_get_runtime_logs`

### STEP 2: SUMMARIZE AND REQUEST APPROVAL (MANDATORY FOR RISKY OPERATIONS)
1. **Summarize current state** based on actual data from Vercel API and GitHub
2. **Summarize planned changes** in detail
3. **Request approval** from user before proceeding with:
   - Code changes
   - Rollbacks
   - Database migrations
   - Configuration changes
4. **WAIT FOR USER APPROVAL** before proceeding

### STEP 3: EXECUTE CHANGES (IF APPROVED)
1. **Create checkpoint** (MANDATORY before risky operations):
   ```bash
   git add .
   git commit -m "checkpoint: before [operation description]"
   git tag checkpoint-YYYY-MM-DD-HH-MM-SS
   git push origin master
   ```
2. **Make code changes** (if approved):
   - Read original code first
   - Preserve field names and logic
   - Follow existing conventions
3. **Test changes locally** (if applicable)
4. **Commit changes**:
   ```bash
   git add .
   git commit -m "[type]: [description]"
   git push origin master
   ```

### STEP 4: DEPLOYMENT (MANDATORY AFTER CODE CHANGES)
1. **Check Vercel project configuration**:
   - Verify `.vercel/project.json` points to correct project ID
   - Admin Panel MUST point to `prj_Un7pZtGDhtaxXOGaOXDajtLDpPWM`
2. **Deploy to Vercel**:
   ```bash
   npx vercel --prod --yes
   ```
3. **Verify deployment**:
   - Check deployment status via Vercel API
   - Fetch live URL to verify it works
   - Check runtime logs for errors

### STEP 5: UPDATE DOCUMENTATION (MANDATORY AFTER DEPLOYMENT)
1. **Update PROJECT_STATUS.md**:
   - Update version number
   - Update deployment information
   - Update feature list if changed
2. **Update CHANGELOG.md**:
   - Add new version entry
   - Document all changes made
   - Include deployment information
3. **Commit documentation**:
   ```bash
   git add PROJECT_STATUS.md CHANGELOG.md
   git commit -m "docs: update PROJECT_STATUS and CHANGELOG to v[X.X.X]"
   git push origin master
   ```
4. **Deploy documentation**:
   ```bash
   npx vercel --prod --yes
   ```

---

## 🔄 ROLLBACK PROCEDURE (IF DEPLOYMENT FAILS)

### 1. IDENTIFY PROBLEM
- Check deployment status via Vercel API
- Check runtime logs for errors
- Fetch live URL to verify issue

### 2. FIND WORKING DEPLOYMENT
- List recent deployments: `mcp0_list_deployments`
- Find deployment that was working before the problem
- Verify the deployment was actually working (check logs, HTTP status)

### 3. ROLLBACK TO WORKING DEPLOYMENT
```bash
npx vercel alias set [deployment-id] th-lotto-admin.vercel.app
```

### 4. VERIFY ROLLBACK
- Fetch live URL to verify it works
- Check runtime logs for errors
- Confirm deployment is stable

### 5. DOCUMENT ROLLBACK
- Update PROJECT_STATUS.md with rollback information
- Update CHANGELOG.md with rollback information
- Commit and push documentation

---

## 🛡️ PROTECTION MEASURES

### 1. CHECKPOINT BEFORE RISKY OPERATIONS
- Always create a git checkpoint before:
  - Code changes
  - Database migrations
  - Configuration changes
  - Rollbacks

### 2. VERIFY BEFORE DEPLOY
- Always verify deployment is working before:
  - Rolling back
  - Aliasing to production
  - Making production changes

### 3. USE VERCEL API FOR VERIFICATION
- Use `mcp0_get_deployment` to check deployment status
- Use `mcp0_web_fetch_vercel_url` to verify live URL works
- Use `mcp0_get_runtime_logs` to check for errors
- Use `mcp0_list_deployments` to find working deployments

### 4. NEVER ASSUME
- Always verify from actual data
- Never assume a deployment is working without checking
- Never assume a commit has a feature without reading commit message
- Never assume field names match without checking RPC/DB

---

## 📊 PROJECT STRUCTURE

### User App
- **Repo**: thlotto3239-star/thlotto-premium
- **Branch**: main
- **Live URL**: https://th-lotto-app.vercel.app
- **Project ID**: prj_tJriP88kWcWOSUQOo8E0UrwSJb7v

### Admin Panel
- **Repo**: thlotto3239-star/TH-LOTTO-Admin-push
- **Branch**: master
- **Live URL**: https://th-lotto-admin.vercel.app
- **Project ID**: prj_Un7pZtGDhtaxXOGaOXDajtLDpPWM

### Current Workspace
- **Current**: c:\Users\armyn\.windsurf\worktrees\thlotto-app-main\thlotto-app-main-9738fbe1
- **This is User App workspace, NOT Admin Panel workspace**
- **Admin Panel local path**: c:\Users\armyn\Downloads\thlotto-admin

---

## 🔍 VERIFICATION CHECKLIST

### Before Any Work
- [ ] Read PROJECT_GUIDE.md
- [ ] Read PROJECT_STATUS.md
- [ ] Read CHANGELOG.md
- [ ] Check current deployment status
- [ ] Check GitHub commit history
- [ ] Verify deployment is working

### Before Code Changes
- [ ] Summarize current state
- [ ] Summarize planned changes
- [ ] Request user approval
- [ ] Create checkpoint
- [ ] Read original code

### Before Deployment
- [ ] Verify .vercel/project.json is correct
- [ ] Commit changes
- [ ] Push to GitHub

### After Deployment
- [ ] Verify deployment works
- [ ] Check runtime logs
- [ ] Update PROJECT_STATUS.md
- [ ] Update CHANGELOG.md
- [ ] Commit documentation
- [ ] Push documentation
- [ ] Deploy documentation

---

## 🚨 COMMON MISTAKES TO AVOID

### 1. Working in Wrong Workspace
- **Problem**: Making changes in User App workspace when working on Admin Panel
- **Solution**: Always verify which repo you're working on before making changes
- **Admin Panel**: TH-LOTTO-Admin-push (branch: master)
- **User App**: thlotto-premium (branch: main)

### 2. Assuming Without Verification
- **Problem**: Assuming a deployment has a feature without checking
- **Solution**: Always read commit messages and verify from Vercel API

### 3. Skipping Checkpoints
- **Problem**: Not creating checkpoints before risky operations
- **Solution**: Always create checkpoint before code changes, migrations, rollbacks

### 4. Not Verifying Deployment
- **Problem**: Rolling back to a deployment without verifying it works
- **Solution**: Always verify deployment works via HTTP status and runtime logs

### 5. Skipping Documentation
- **Problem**: Not updating PROJECT_STATUS.md and CHANGELOG.md
- **Solution**: Always update documentation after deployment

### 6. Using Wrong Project ID
- **Problem**: Deploying to wrong Vercel project
- **Solution**: Always verify .vercel/project.json points to correct project ID
- **Admin Panel**: prj_Un7pZtGDhtaxXOGaOXDajtLDpPWM
- **User App**: prj_tJriP88kWcWOSUQOo8E0UrwSJb7v

---

## 📝 EXAMPLE WORKFLOW

### Scenario: Adding a New Feature

1. **Initial Analysis**:
   - Read PROJECT_GUIDE.md, PROJECT_STATUS.md, CHANGELOG.md
   - Check current deployment status
   - Check GitHub commit history
   - Verify deployment is working

2. **Summarize and Request Approval**:
   - Summarize current state
   - Summarize planned feature
   - Request approval from user

3. **Execute Changes** (if approved):
   - Create checkpoint
   - Read original code
   - Make code changes
   - Test locally
   - Commit changes
   - Push to GitHub

4. **Deployment**:
   - Verify .vercel/project.json
   - Deploy to Vercel
   - Verify deployment works
   - Check runtime logs

5. **Update Documentation**:
   - Update PROJECT_STATUS.md
   - Update CHANGELOG.md
   - Commit documentation
   - Push documentation
   - Deploy documentation

---

## 🔐 SECURITY CONSIDERATIONS

### 1. Never Hardcode Credentials
- Use environment variables
- Never commit API keys
- Use Supabase auth properly

### 2. Never Skip Auth
- Preserve SHA256 auth flow
- Never change auth logic
- Use JWT properly

### 3. Never Expose Sensitive Data
- Never log sensitive information
- Use proper error handling
- Validate all inputs

---

## 📞 CONTACT

### Project Owner
- **GitHub**: thlotto3239-star
- **Admin Panel**: TH-LOTTO-Admin-push
- **User App**: thlotto-premium

### Support
- **Vercel**: https://vercel.com/thlotto3239-1721s-projects
- **Supabase**: Check PROJECT_STATUS.md for details

---

## 📌 IMPORTANT NOTES

1. **This workflow is MANDATORY for all AI agents**
2. **Never skip steps in this workflow**
3. **Always verify from actual data, never assume**
4. **Always create checkpoints before risky operations**
5. **Always update documentation after deployment**
6. **Always verify deployment works after changes**
7. **Never work in wrong workspace**
8. **Never use wrong project ID**
9. **Never skip approval for risky operations**
10. **Never make unauthorized code changes**

---

**Last Updated**: 2026-05-15
**Version**: 1.0.0
**Status**: Active
