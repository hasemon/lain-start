---
name: hrm-stack
description: "ACTIVATE before building any HRM feature (organization, employees, attendance/ZKTeco, shifts, leave, payroll, recruitment, performance, lifecycle). Maps every installed package to its job — Actions, Form Requests, spatie/laravel-data DTOs, API Resources, spatie/laravel-query-builder, spatie/laravel-permission, spatie/laravel-medialibrary, spatie/laravel-activitylog, sluggable, TanStack Query v5, TanStack Table v9, shadcn/ui, Wayfinder, Inertia v3 — and tells you which sibling skill to load for each layer. Use when choosing a tool, scaffolding a module, building a data table, uploading files, filtering/sorting lists, checking permissions, or logging audits."
license: MIT
metadata:
  author: hrm
---

# HRM Stack Map

The single source of truth for **which tool does which job** in this HRM. Read this first, then load the sibling skill listed for the layer you are touching. Do not introduce a second tool for a job already mapped here. Do not add dependencies without user approval (see "Gaps").

## 1. Installed Inventory (verified from composer.lock / node_modules)

### Backend (PHP 8.4, Laravel 13.32)

| Package | Version | Job in HRM | Load skill / docs |
|---|---|---|---|
| laravel/framework | 13.32 | Core: Form Requests, API Resources, Policies, Enums, Jobs, Notifications, Events | `laravel-best-practices`, `search-docs` |
| inertiajs/inertia-laravel | 3.3 | Page rendering, initial props, redirects, flash | `inertia-react-development` |
| laravel/fortify + laravel/passkeys | 1.39 / 0.2 | Auth, 2FA, passkeys (already wired) | `fortify-development` |
| laravel/wayfinder | 0.1.21 | Typed TS route/controller functions (`@/routes`, `@/actions`) | `wayfinder-development` |
| spatie/laravel-permission | 8.3 | Roles & granular permissions (`employees.view` …). `teams => false` | `search-docs` packages=[spatie/laravel-permission] |
| spatie/laravel-query-builder | 7.3 | Server-side filter / sort / include for every table API | `search-docs` |
| spatie/laravel-data | 4.23 | Typed DTOs passed from Request → Action; enum/date casting | `search-docs` |
| spatie/laravel-medialibrary | 11.23 | Employee documents, profile photo, certificates, attachments | `search-docs` |
| spatie/laravel-activitylog | 5.1 | Audit trail + Activity tab (v5 API — verify before use) | `search-docs` |
| spatie/laravel-sluggable | 4.0 | Slugs for Company/Branch/Department/Designation/Job Opening | `search-docs` |
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

| Package | Version | Job in HRM | Load skill / docs |
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
| Scope rows to a manager's team | Eloquent scope applied inside the query (before Query Builder) | Fetch all then filter in JS |
| Permissions | **spatie/laravel-permission** (`HasRoles` on `User`) + **Policies** + `can:` middleware; share abilities to React via `HandleInertiaRequests` for UX only | Frontend-only checks |
| Files (documents, photos, certificates, payslip PDFs) | **spatie/laravel-medialibrary** `HasMedia` + named collections (`documents`, `photo`, …), metadata in own table (type, number, expiry) | Manual `Storage::put` + path columns |
| Audit trail | **spatie/laravel-activitylog** on sensitive models (employee, salary, bank, payroll, leave approval, adjustments) + explicit `activity()` logs inside Actions | Custom audit tables |
| Slugs | **spatie/laravel-sluggable** `HasSlug` | Hand-written slug code |
| States | PHP backed **Enums** in `app/Enums/` (TitleCase keys) cast on models; laravel-data casts enums automatically | Magic strings |
| Frontend URLs | **Wayfinder** `import { index } from '@/actions/App/Http/Controllers/EmployeeController'` → `index.url({ query })` | Hardcoded `/api/...` strings |
| Page navigation / simple CRUD forms | **Inertia** `<Form>` / `useForm` + Wayfinder `.form()` | TanStack Query for page-level forms |
| Table data, search dropdowns, widgets, approve/reject | **TanStack Query** hooks in `resources/js/queries/`, `resources/js/mutations/`; structured keys `['employees', filters]`; invalidate narrowly | Duplicate the same data via Inertia props and Query |
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
public function store(StoreEmployeeRequest $request, CreateEmployeeAction $createEmployee): RedirectResponse
{
    $employee = $createEmployee->execute(EmployeeData::from($request->validated()));

    return to_route('employees.show', $employee);
}

public function index(IndexEmployeeRequest $request): AnonymousResourceCollection
{
    $this->authorize('viewAny', Employee::class);

    $employees = QueryBuilder::for(Employee::query()->visibleTo($request->user()))
        ->allowedFilters([
            AllowedFilter::custom('search', new EmployeeSearchFilter),
            AllowedFilter::exact('department_id'),
            AllowedFilter::exact('status'),
        ])
        ->allowedSorts(['employee_no', 'first_name', 'joining_date', 'created_at'])
        ->defaultSort('-created_at')
        ->paginate($request->integer('per_page', 25))
        ->withQueryString();

    return EmployeeResource::collection($employees); // { data, links, meta }
}
```

Verify exact Query Builder v7, Data v4, Permission v8, Activitylog v5 and Media Library v11 signatures with `search-docs` before writing — do not rely on memory of older majors.

## 4. Canonical Frontend Slice

```text
pages/employees/index.tsx
  → components/employees/employee-columns.tsx   (column defs, stable module-level)
  → components/employees/employee-filters.tsx   (serializable filter state, synced to URL)
  → queries/use-employees.ts                    (useQuery(['employees', params]))
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
- Map sorting state → `sort=-created_at,first_name`; filters → `filter[department_id]=5`; pagination → `page`, `per_page` (1-based page on the server, 0-based `pageIndex` in the table).

### shadcn/ui

- Installed in `resources/js/components/ui/` (new-york, radix). Already present: accordion, alert, avatar, badge, breadcrumb, button, button-group, calendar, card, chart, checkbox, collapsible, dialog, drawer, dropdown-menu, empty, field, hover-card, input, input-group, input-otp, item, kbd, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, spinner, switch, table, textarea, toggle, toggle-group, tooltip.
- **Not yet installed but required by the project spec:** `command` (combobox), `tabs`, `alert-dialog`. Add with `npx shadcn@latest add command tabs alert-dialog` (a new component is not a new dependency decision, but mention it).
- Do not hand-edit `components/ui/*` beyond necessary fixes; they are excluded from lint/format. Do not run the `migrate-radix-to-base` skill unless the user asks.
- Loading → `Skeleton`; empty → `Empty`; errors → `Alert`.

## 5. Current State of the Codebase (starter kit only)

- `app/Actions/` holds only `Fortify/`. No domain Actions, Data, Enums, Policies, Resources or `routes/api.php` yet — create them following section 3.
- `User` model does **not** yet use `HasRoles`, `LogsActivity` or `HasMedia`.
- `resources/js` has no `queries/`, `mutations/`, `lib/api/`, `components/data-table/` and no `QueryClientProvider` in `app.tsx` — Phase 1 must add these once, then every module reuses them.
- Migrations published: media, permission tables, activity_log.
- `.env.example` uses `DB_CONNECTION=sqlite`; the project targets MySQL/MariaDB — confirm with the user before switching.
- `config/media-library.php` default disk is `public`. HR documents (NID, passport, contracts, payslips) are sensitive: use a private disk + authorized download route / temporary URLs.

## 6. Gaps — ask the user before adding any of these

| Need (from project spec) | Status | Typical options |
|---|---|---|
| react-hook-form + zod for complex forms | Not installed | `react-hook-form`, `zod`, `@hookform/resolvers` |
| Excel / CSV export & import | Not installed | `maatwebsite/excel` or `spatie/simple-excel` |
| PDF payslips / letters | Not installed | `spatie/laravel-pdf` or `barryvdh/laravel-dompdf` |
| ZKTeco biometric device integration | Not installed | ZKTeco push (ADMS/iclock HTTP) endpoint, or a ZK protocol library — decide transport first; wrap in `BiometricDeviceService` |
| TS types generated from Data/Resources | Not installed | `spatie/laravel-typescript-transformer`; until then write types manually in `resources/js/types/` |
| Backups | Not installed | `spatie/laravel-backup` |

## 7. Checklist Before Writing Code

1. Load this skill + the layer skills (`laravel-best-practices`, `spatie-laravel-php`, `inertia-react-development`, `wayfinder-development`, `shadcn`, `tailwindcss-development`, `testing-best-practices`).
2. `database-schema` to inspect tables; `search-docs` for the installed package majors.
3. Reuse existing Actions / Resources / DataTable / query hooks before creating new ones.
4. Follow the AI coding sequence in the project instructions (migration → enum → model → requests → data → actions → policy → resources → controller → routes → tests → types → api → query hooks → columns → filters → page).
5. Finish with `vendor/bin/pint --dirty --format agent`, targeted Pest tests, `npm run check`, `npm run types:check`.
