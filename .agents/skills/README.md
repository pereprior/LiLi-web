# Frontend skills

These skills are installed locally for LiLi Web. Their complete upstream
directories include the detailed guides and rule files linked from `SKILL.md`.

| Local skill                   | Purpose                                                       | Upstream path                                          |
| ----------------------------- | ------------------------------------------------------------- | ------------------------------------------------------ |
| `vercel-react-best-practices` | React performance, hooks, rendering, and client data fetching | `vercel-labs/agent-skills/skills/react-best-practices` |
| `vercel-composition-patterns` | React component APIs and composition                          | `vercel-labs/agent-skills/skills/composition-patterns` |
| `material-ui-styling`         | Local styles, reusable styles, overrides, and component slots | `mui/material-ui/skills/material-ui-styling`           |
| `material-ui-theming`         | Theme, typography, palette, spacing, and color schemes        | `mui/material-ui/skills/material-ui-theming`           |

Installed on 2026-10-12 from these pinned revisions:

- [Vercel agent-skills](https://github.com/vercel-labs/agent-skills/tree/063bee94c3f4df8453406c830b0a7df0f2860278/skills):
  `063bee94c3f4df8453406c830b0a7df0f2860278`.
- [MUI material-ui](https://github.com/mui/material-ui/tree/41c9cb4030274f3bde585d136949f447674e728b/skills):
  `41c9cb4030274f3bde585d136949f447674e728b`.

Both sources declare the MIT license. The imported skill files are preserved
apart from repository formatting and three corrected relative links in the
compiled Vercel React guide (pointing to its `rules/` directory). When updating, review the upstream changes,
install the complete directories, validate their frontmatter and local links,
and update the pinned revisions here.

Read the repository's `AGENTS.md` before applying these guides. LiLi Web uses
React 19 and Vite; only applicable React guidance should be used from examples
that also discuss Next.js. The MUI guides target v9, while `@mui/material` is
not installed yet. Check the selected dependency version and its official
documentation before applying version-specific APIs.

The existing `vitest` and `lili-testing` directories predate this installation.
