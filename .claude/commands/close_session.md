# Close Session

You are ending a development session for the Tabiya Taxonomy Explorer. Complete the following steps:

## 1. Take Stock of Work Done
Review what was accomplished this session:
- What tasks were completed?
- What files were created or modified?
- What issues were encountered?
- What decisions were made?

## 2. Verify Decision Log
Read `.claude/docs/DECISIONS.md` and verify all decisions from this session are logged.
(Note: Decisions should have been logged immediately when made. Only add any that were missed.)

If adding a missed decision, use the format:
```
## Decision #[N]
**Date:** [YYYY-MM-DD]
**Decision:** [Brief title]
**Context:** [Why this decision was needed]
**Choice:** [What was decided]
**Rationale:** [Why this choice was made]
**Impact:** [How this affects the project]
```

## 3. Verify Todo List
Read `.claude/docs/TODO.md` and verify all task statuses are current.
(Note: Task statuses should have been updated live throughout the session.)

- Verify completed tasks show [x] (should already be marked with user confirmation)
- Verify in-progress tasks show [~]
- Add any new tasks discovered during the session
- Update the "Last Updated" date at the bottom

## 4. Regenerate Session Context
Completely rewrite `.claude/docs/SESSION_CONTEXT.md` with:
- Today's date and session summary
- List of what was done this session
- Key decisions made (reference decision log numbers)
- Current project state and phase
- List of files modified
- Notes and priorities for the next session
- Any blockers or dependencies

## 5. Update Project Status
Read `.claude/docs/PROJECT_STATUS.md` and update:
- The "Last Updated" date
- Current Status section
- Development Phases progress
- Key Metrics if any were measured
- Any new risks identified

## 6. Verify Build Status
If any code was written, ensure:
```bash
npm run lint      # No errors
npm run type-check  # No TypeScript errors
npm run build     # Production build succeeds
```

Report any issues that need to be addressed next session.

## 7. Confirm Completion
After completing all updates, provide a brief summary:
- Number of tasks completed this session
- Current phase and overall progress
- Top priority for next session
- Any blockers or items needing attention

Say "Session closed. All tracking documents updated." when complete.

---

## Quick Checklist

Before closing:
- [ ] DECISIONS.md is up to date
- [ ] TODO.md statuses are current
- [ ] SESSION_CONTEXT.md is rewritten for next session
- [ ] PROJECT_STATUS.md is updated
- [ ] Code lints and builds (if applicable)
- [ ] Any git commits made (if requested)
