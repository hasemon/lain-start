---
name: laravel-react-stack
description: "ACTIVATE before building any feature in a Laravel + Inertia React + Spatie + TanStack + shadcn application. Maps every installed package to its job — Actions, Form Requests, spatie/laravel-data DTOs, API Resources, spatie/laravel-query-builder, spatie/laravel-permission, spatie/laravel-medialibrary, spatie/laravel-activitylog, sluggable, TanStack Query v5, TanStack Table v9, shadcn/ui, Wayfinder, Inertia v3 — and tells you which sibling skill to load for each layer. Use when choosing a tool, scaffolding a module, building a data table, uploading files, filtering/sorting lists, checking permissions, or logging audits."
license: MIT
metadata:
  author: imemon
---

# Laravel React Stack Map

The single source of truth for **which tool does which job** in this application. Read this first, then load the sibling skill listed for the layer you are touching. Do not introduce a second tool for a job already mapped here. Do not add dependencies without user approval (see "Gaps").

## 1. Installed Inventory (verified from composer.lock / node_modules)

> Baseline for this stack. When starting a new app, re-check versions with `composer show --direct` and `package.json` and update this table.

### Backend (PHP 8.4, Laravel 13.32)

| Package | Version | Job | Load skill / docs |
|---|---|---|---|
| laravel/framework | 13.32 | Core: Form Requests, API Resources, Policies, Enums, Jobs, Notifications, Events | `laravel-best-practices`, `search-docs` |
| inertiajs/inertia-laravel | 3.3 | Page rendering, initial props, redirects, flash | `inertia-react-development` |
| laravel/fortify + laravel/passkeys | 1.39 / 0.2 | Auth, 2FA, passkeys (already wired) | `fortify-development` |
| laravel/wayfinder | 0.1.21 | Typed TS route/controller functions (`@/routes`, `@/actions`) | `wayfinder-development` |
| spatie/laravel-permission | 8.3 | Roles & granular permissions (`{resource}.{ability}`, e.g. `posts.view`). `teams => false` | `search-docs` packages=[spatie/laravel-permission] |
| spatie/laravel-query-builder | 7.3 | Server-side filter / sort / include for every table API | `search-docs` |
| spatie/laravel-data | 4.23 | Typed DTOs passed from Request → Action; enum/date casting | `search-docs` |
| spatie/laravel-medialibrary | 11.23 | Uploads: documents, avatars, images, attachments | `search-docs` |
| spatie/laravel-activitylog | 5.1 | Audit trail + Activity tab (v5 API — verify before use) | `search-docs` |
| spatie/laravel-sluggable | 4.0 | Human-readable slugs for public/lookup models | `search-docs` |
| laravel/tinker, laravel/pail | — | Debug / log tailing | — |
| laravel/chisel, laravel/pao | 0.1 / 1.1 | Starter-kit tooling — purpose unverified; do not build on them without checking `composer show` + docs | — |

### Dev / Quality

| Package | Job | Command |
|---|---|---|
| pestphp/pest 5 (+ laravel, arch, mutate plugins) | Tests. Use arch tests to enforce "no business logic in controllers" | `php artisan test --compact --filter=…` |
| larastan 3 | Static analysis | `composer types:check` |
| laravel/pint | PHP formatting | `vendor/bin/pint --dirty --format agent` |
| laravel/boost 2.9 (MCP) | `search-docs`, `database-schema`, `database-query`, `browser-logs`, `get-absolute-url` | via MCP |
| spatie/guidelines-skills | Code style | `spatie-laravel-php`, `spatie-javascript` |
| vite-plus (`vp`) | JS lint + format (oxlint/oxfmt, Tailwind class sort) | `npm run check`, `npm run types:check` |

### Frontend (React 19 + React Compiler, TypeScript 5, Vite 8)

| Package | Version | Job | Load skill / docs |
|---|---|---|---|
| @inertiajs/react | 3 | Pages, layouts, `<Form>`/`useForm`, `router`, `useHttp` | `inertia-react-development` |
| @tanstack/react-query | 5.103 | Table data, async search, dependent dropdowns, dashboard widgets, mutations | TanStack Query v5 docs |
| @tanstack/react-table | **9.2.4 (v9, NOT v8)** | Shared DataTable engine | Bundled skills: `node_modules/@tanstack/react-table/skills/*` and `node_modules/@tanstack/table-core/skills/*` |
| shadcn (CLI 4.21) + radix-ui | style `new-york`, base color neutral, lucide icons | All UI components | `shadcn` skill + shadcn MCP |
| tailwindcss | 4 | Styling via CSS tokens in `resources/css/app.css` | `tailwindcss-development` |
| recharts 3.8 + `components/ui/chart.tsx` | Dashboard / report charts | shadcn chart docs |
| react-day-picker 10 + `ui/calendar.tsx`, date-fns 4 | Date / range pickers, attendance calendars, date formatting | — |
| sonner + `hooks/use-flash-toast.ts` | Toasts (flash messages from Laravel) | — |
| vaul (`ui/drawer`), embla (`ui/carousel`), react-resizable-panels (`ui/resizable`), input-otp | Specific UI needs | — |

MCP servers (`.mcp.json`): `laravel-boost`, `shadcn`. App is served by **Laravel Herd** — never run `php artisan serve`.

## 2. Task → Tool Map

| When you need to… | Use | Never |
|---|---|---|
| Validate + authorize HTTP input | **Form Request** in `app/Http/Requests/{Domain}/` | Inline `$request->validate()` in controllers; Data-object validation as a substitute |
| Pass validated input into business logic | **spatie/laravel-data** `{Thing}Data` in `app/Data/{Domain}/` built with `::from($request->validated())` | Loose arrays across several layers |
| Run a business operation | **Action class** `app/Actions/{Domain}/{Verb}{Noun}Action.php`, single public `execute()` method, constructor-injected deps, `DB::transaction()` when touching multiple records | Logic in controllers, models, React, or "god" services |
| Shape JSON / Inertia props | **Laravel API Resource** `app/Http/Resources/…` with `$this->when($user->can(...))` for sensitive fields | Returning raw models; hiding fields only in React |
| List / filter / sort / paginate | **spatie/laravel-query-builder** `QueryBuilder::for()` + `allowedFilters/allowedSorts` + custom `SearchFilter` for multi-column search, then `->paginate()->withQueryString()` wrapped in `Resource::collection()` | Client-side filtering of big datasets; `%like%` on every column |
| Scope rows to what the user may see | Eloquent scope applied inside the query (before Query Builder) | Fetch all then filter in JS |
| Permissions | **spatie/laravel-permission** (`HasRoles` on `User`) + **Policies** + `can:` middleware; share abilities to React via `HandleInertiaRequests` for UX only | Frontend-only checks |
| Files (documents, photos, attachments, generated PDFs) | **spatie/laravel-medialibrary** `HasMedia` + named collections (`documents`, `photo`, …), domain metadata in its own table when needed | Manual `Storage::put` + path columns |
| Audit trail | **spatie/laravel-activitylog** on important/sensitive models + explicit `activity()` logs inside Actions | Custom audit tables |
| Slugs | **spatie/laravel-sluggable** `HasSlug` | Hand-written slug code |
| States | PHP backed **Enums** in `app/Enums/` (TitleCase keys) cast on models; laravel-data casts enums automatically | Magic strings |
| Frontend URLs | **Wayfinder** `import { index } from '@/actions/App/Http/Controllers/PostController'` → `index.url({ query })` | Hardcoded `/api/...` strings |
| Page navigation / simple CRUD forms | **Inertia** `<Form>` / `useForm` + Wayfinder `.form()` | TanStack Query for page-level forms |
| Table data, search dropdowns, widgets, row actions (approve/delete…) | **TanStack Query** hooks in `resources/js/queries/`, `resources/js/mutations/`; structured keys `['posts', filters]`; invalidate narrowly | Duplicate the same data via Inertia props and Query |
| Tables | **Shared DataTable** in `resources/js/components/data-table/` on **TanStack Table v9** + shadcn `ui/table` | Per-page hand-built `<table>` markup |
| Complex forms | shadcn `ui/field` + Inertia `useForm` today (react-hook-form/zod not installed — see Gaps) | Mixing form systems per page |
| Charts | shadcn `ui/chart` (recharts) | Other chart libs |
| Toasts / confirmations | `sonner`, shadcn AlertDialog (add via CLI) | `window.confirm/alert` |

## 3. Canonical Backend Slice

```text
Route (routes/web.php or routes/api.php, named)
  → Form Request (rules + authorize)
  → Controller (thin: resolve Data, call Action, return Resource / Inertia / redirect)
  → Action::execute(Data) (transaction, domain rules, activity log, notifications)
  → Model (relations, casts, scopes)
  → Resource (permission-aware shape)
```

```php
public function store(StorePostRequest $request, CreatePostAction $createPost): RedirectResponse
{
    $post = $createPost->execute(PostData::from($request->validated()));

    return to_route('posts.show', $post);
}

public function index(IndexPostRequest $request): AnonymousResourceCollection
{
    $this->authorize('viewAny', Post::class);

    $posts = QueryBuilder::for(Post::query()->visibleTo($request->user()))
        ->allowedFilters([
            AllowedFilter::custom('search', new PostSearchFilter),
            AllowedFilter::exact('category_id'),
            AllowedFilter::exact('status'),
        ])
        ->allowedSorts(['title', 'published_at', 'created_at'])
        ->defaultSort('-created_at')
        ->paginate($request->integer('per_page', 25))
        ->withQueryString();

    return PostResource::collection($posts); // { data, links, meta }
}
```

Verify exact Query Builder v7, Data v4, Permission v8, Activitylog v5 and Media Library v11 signatures with `search-docs` before writing — do not rely on memory of older majors.

## 4. Canonical Frontend Slice

```text
pages/posts/index.tsx
  → components/posts/post-columns.tsx   (column defs, stable module-level)
  → components/posts/post-filters.tsx   (serializable filter state, synced to URL)
  → queries/use-posts.ts                    (useQuery(['posts', params]))
  → lib/api/client.ts                           (single fetch client: JSON, X-XSRF-TOKEN, 401/403/422/500 handling)
  → Wayfinder action .url({ query })
  → components/data-table/*                     (TanStack Table v9 + shadcn)
```

### TanStack Table v9 rules (installed version — v8 examples, including shadcn's data-table docs, will NOT compile as-is)

- Read `node_modules/@tanstack/react-table/skills/getting-started`, `with-tanstack-query`, `create-table-hook`, `table-state` and `node_modules/@tanstack/table-core/skills/{core,table-features,client-vs-server,pagination,sorting,row-selection,column-visibility}` before building the DataTable. If adapting v8 code, read `migrate-v8-to-v9`.
- Register only the features you use with `tableFeatures({ rowSortingFeature, rowPaginationFeature, rowSelectionFeature, columnVisibilityFeature, ... })`; do not use `stockFeatures`.
- Server tables: `manualPagination`, `manualSorting`, `manualFiltering` all `true`, pass `rowCount: meta.total`, and put pagination/sorting/filter state into the TanStack Query key.
- Keep `data` and `columns` references stable (module constants / memo); use `placeholderData: keepPreviousData` so rows don't flash on refetch.
- Call instance methods on their instance (`row.getValue()`), never destructure them.
- Map sorting state → `sort=-created_at,first_name`; filters → `filter[category_id]=5`; pagination → `page`, `per_page` (1-based page on the server, 0-based `pageIndex` in the table).

### shadcn/ui

- Installed in `resources/js/components/ui/` (new-york, radix). Already present: accordion, alert, avatar, badge, breadcrumb, button, button-group, calendar, card, chart, checkbox, collapsible, dialog, drawer, dropdown-menu, empty, field, hover-card, input, input-group, input-otp, item, kbd, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, spinner, switch, table, textarea, toggle, toggle-group, tooltip.
- **Commonly needed but not in the starter kit:** `command` (combobox), `tabs`, `alert-dialog` — check `components/ui/` first. Add with `npx shadcn@latest add command tabs alert-dialog` (a new component is not a new dependency decision, but mention it).
- Do not hand-edit `components/ui/*` beyond necessary fixes; they are excluded from lint/format. Do not run the `migrate-radix-to-base` skill unless the user asks.
- Loading → `Skeleton`; empty → `Empty`; errors → `Alert`.

## 5. Project Setup Checklist (verify per app — the starter kit ships none of this)

- Domain folders exist? `app/Actions`, `app/Data`, `app/Enums`, `app/Policies`, `app/Http/Resources`, `routes/api.php` — create on first use following section 3.
- `User` uses `HasRoles` (and `LogsActivity` / `HasMedia` if needed)?
- Frontend foundation exists once? `QueryClientProvider` in `app.tsx`, `lib/api/client.ts`, `queries/`, `mutations/`, `components/data-table/`. Build it once, reuse everywhere.
- Spatie migrations published (media, permission tables, activity_log)?
- `DB_CONNECTION` in `.env.example` matches the real target database — confirm with the user.
- `config/media-library.php` default disk is `public`. Sensitive files must use a private disk + authorized download route / temporary URLs.
- App-specific rules (domain workflows, module order) live in the project instructions / `AGENTS.md`, not in this skill.

## 6. Common Gaps — ask the user before adding any of these

| Need | Typical options |
|---|---|
| react-hook-form + zod for complex forms | `react-hook-form`, `zod`, `@hookform/resolvers` |
| Excel / CSV export & import | `maatwebsite/excel` or `spatie/simple-excel` |
| PDF generation | `spatie/laravel-pdf` or `barryvdh/laravel-dompdf` |
| TS types generated from Data/Resources | `spatie/laravel-typescript-transformer`; until then write types manually in `resources/js/types/` |
| Backups | `spatie/laravel-backup` |
| External devices / third-party APIs | Wrap in a dedicated Service class behind a contract |

Check `composer.json` / `package.json` first — a gap may already be filled.

## 7. Checklist Before Writing Code

1. Load this skill + the layer skills (`laravel-best-practices`, `spatie-laravel-php`, `inertia-react-development`, `wayfinder-development`, `shadcn`, `tailwindcss-development`, `testing-best-practices`).
2. `database-schema` to inspect tables; `search-docs` for the installed package majors.
3. Reuse existing Actions / Resources / DataTable / query hooks before creating new ones.
4. Follow the coding sequence (migration → enum → model → requests → data → actions → policy → resources → controller → routes → tests → types → api → query hooks → columns → filters → page).
5. Tests must never reset the database: no `RefreshDatabase`, `LazilyRefreshDatabase`, `DatabaseMigrations`, `DatabaseTruncation`, `migrate:fresh/refresh/reset` or `db:wipe`.
6. Finish with `vendor/bin/pint --dirty --format agent`, targeted Pest tests, `npm run check`, `npm run types:check`.
