# Start Session

You are beginning a development session for the Tabiya Taxonomy Explorer rebuild. Complete the following steps to get up to speed:

## 1. Read Technical Specification
Read `.claude/docs/TECHNICAL_SPECIFICATION.md` to understand:
- Project overview and objectives
- Tech stack decisions (React, Vite, TypeScript, Tailwind)
- System architecture
- Data model and CSV file structure
- Component architecture
- Performance strategy
- Deployment approach

## 2. Read Decision Log
Read `.claude/docs/DECISIONS.md` to understand:
- Key architectural decisions already made
- Rationale behind technical choices
- Any constraints or commitments

## 3. Read Todo List
Read `.claude/docs/TODO.md` to understand:
- Current development phase
- Tasks completed so far
- Tasks in progress
- What's coming next

## 4. Read Session Context
Read `.claude/docs/SESSION_CONTEXT.md` to understand:
- What was done in the last session
- Current project state
- Files that were recently modified
- Notes and priorities from the previous session
- Any blockers or dependencies

## 5. Read Design System
Read `.claude/docs/DESIGN_SYSTEM.md` for:
- Color palette and usage
- Typography scale
- Component specifications
- Spacing and layout guidelines
- Accessibility requirements

## 6. Confirm Understanding
After reading all documents, provide a brief status report:

### Current State
- What phase we're in
- What's been completed recently
- Any blockers or issues

### Next Tasks
List the 2-3 highest priority tasks to work on this session based on:
- Incomplete tasks from the last session
- Next logical steps in the current phase
- Any urgent items noted in session context

### Ready Check
Confirm: "Ready to continue development. Starting with [specific task]."

Ask if the user wants to proceed with the identified tasks or has different priorities for this session.

---

## Development Guidelines

### Code Style
- Follow existing ESLint/Prettier configuration
- Use TypeScript strictly (no `any` types)
- Prefer functional components with hooks
- Use Tailwind utility classes for styling

### Verification
After making code changes:
1. Run `npm run lint` to check for issues
2. Run `npm run type-check` for TypeScript errors
3. Run `npm run build` to verify production build
4. Test changes in browser before committing

### Commit Practices
- Only commit when explicitly asked
- Use conventional commit messages
- Run lint/build before committing

### Documentation Updates
- Update DECISIONS.md immediately when making architectural decisions
- Update TODO.md when completing or starting tasks
- Keep SESSION_CONTEXT.md current throughout the session
