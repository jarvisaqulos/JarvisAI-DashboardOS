# Security Notes - NEVER COMMIT THESE

## SSL/TLS Certificates
- **Location:** `certs/`
- **Status:** Gitignored (never commit)
- **Files:** *.key, *.crt, *.pem
- **Why:** Private keys exposed publicly = security breach

## API Keys & Secrets
- `.env` files
- `*_SECRET*` or `*_KEY*` environment variables
- Any file containing: api_key, secret, token, password

## What Happened (Feb 2, 2026)
- Accidentally committed `certs/localhost.key` to GitHub
- GitGuardian alerted us within 1 hour
- Remediated by:
  1. Removing key from git history
  2. Adding `certs/` to .gitignore
  3. Generating new certificates
  4. Verifying no keys remain in repo

## Prevention
- Always check `git status` before committing
- Use `git add -p` to review changes
- When in doubt: `git diff --cached` to see what's staged
- SSL certs go in `certs/` which is auto-ignored
