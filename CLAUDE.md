# BowlSync — project notes for Claude

## Writing to `.git/sdd/` (superpowers SDD scratch dir)

Claude Code hard-blocks Edit/Write **tool** calls to any path under `.git/` —
it forces a permission prompt that no allow rule, hook, or permission mode
(including `acceptEdits`) can suppress. The superpowers
`subagent-driven-development` skill stores its ledger and reports under
`.git/sdd/`, so editing them with the Edit/Write tool prompts every time.

**Bash writes to `.git/` are NOT blocked.** So:

- **Never** use the Edit/Write/MultiEdit tool on any file under `.git/sdd/`.
- Update the progress ledger with a bash append instead, e.g.:

  ```bash
  echo "Task N: complete (commits <base7>..<head7>, review clean)" \
    >> "$(git rev-parse --git-path sdd)/progress.md"
  ```

- To create/overwrite a file under `.git/sdd/`, write it via bash
  (`cat > … <<'EOF'`, `printf`, redirection) — not the Write tool.
- Reading those files with the Read tool or `cat` is fine (reads aren't blocked).
