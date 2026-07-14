---
name: Design subagent deep-import bug
description: The design subagent sometimes imports generated API client hooks via a deep path instead of the package root, breaking Vite dependency scanning.
---

When a DESIGN subagent builds a react-vite frontend against `@workspace/api-client-react`, it has occasionally imported hooks like `useListProducts` from `@workspace/api-client-react/src/generated/api` instead of the package root `@workspace/api-client-react`. The deep path is not an exported subpath, so Vite's dependency scanner fails with "Missing './src/generated/api' specifier" and the whole frontend 500s.

**Why:** The package only exports its root entry (re-exporting `./generated/api` and `./generated/types` internally); deep imports bypass the package's `exports` map.

**How to apply:** After a design subagent finishes a react-vite frontend, grep for `@workspace/api-client-react/src/generated` (and similar deep-import patterns for other generated packages) before restarting workflows. Fix with a simple `sed` replacing the deep path with the bare package name across the affected files.
