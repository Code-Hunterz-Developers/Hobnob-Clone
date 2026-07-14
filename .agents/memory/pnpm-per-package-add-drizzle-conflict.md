---
name: pnpm per-package add can break shared drizzle-orm types
description: Running `pnpm add` inside a package that transitively uses drizzle-orm (via a workspace lib) can create two separate drizzle-orm instances with incompatible types.
---

Running `pnpm add <pkg>` directly inside an artifact package (e.g. `artifacts/api-server`) that imports tables from a workspace `db` lib can cause pnpm to resolve a second, differently-peer-resolved copy of `drizzle-orm` for that package. Symptom: `tsc` errors like "Types have separate declarations of a private property 'shouldInlineParams'" or "Property 'config' is protected but type ... is not a class derived from ...", pointing at `.where(eq(colA, colB))` calls that previously typechecked fine.

**Why:** drizzle-orm's peer resolution depends on which packages declare `pg` (or another driver) as a direct dependency. If the db lib depends on `pg` directly but the consuming package doesn't, pnpm may hoist/resolve drizzle-orm differently for each, producing two nominally-identical but structurally distinct `drizzle-orm` module instances.

**How to apply:** if you add new deps to a package that imports Drizzle tables from a shared lib and typecheck suddenly fails with these errors, add the same driver dependency (e.g. `pg` + `@types/pg`) directly to that package too, so both packages resolve the same drizzle-orm peer variant. Re-run typecheck after.
