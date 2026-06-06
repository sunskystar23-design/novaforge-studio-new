# Knowledge Engine Foundation

The Knowledge Engine is NOVAFORGE's modular creative intelligence library for Creative Studio V2. It stores reusable creative knowledge as small JSON modules instead of hardcoding creative direction inside `src/app.js` or tying prompt logic to the current Product Command Center UI.

## 1. What the Knowledge Engine Is

The Knowledge Engine is a structured collection of JSON libraries under `knowledge/`. Each module describes a reusable creative ingredient such as a style, character type, location, emotion, camera treatment, lighting approach, platform format, transition, typography direction, or audio mood.

The current foundation is intentionally data-only:

- No UI has been added.
- No AI calls have been added.
- No Product Command Center workflow has been changed.
- No Supabase product logic has been changed.

## 2. How Modules Work

Every module JSON follows the same base schema:

```json
{
  "id": "stable_module_id",
  "name": "Human Readable Name",
  "description": "What this module means and when it should be used.",
  "keywords": ["search", "matching", "terms"],
  "prompt_fragments": ["short reusable prompt phrase"],
  "related_modules": ["path/or/module_id"]
}
```

### Field Roles

- `id`: Stable machine-readable identifier for search, references, and future prompt assembly.
- `name`: Human-readable label for Creative Studio interfaces.
- `description`: Explains the creative use case.
- `keywords`: Terms used by Creative Search and matching systems.
- `prompt_fragments`: Reusable pieces of prompt language for future AI Director workflows.
- `related_modules`: Suggested companion modules or future module references.

## 3. How AI Director Will Use Modules

The future AI Director Panel can combine modules with selected product data to build structured creative directions. For example:

1. Product Command Center selects products.
2. Creative Studio V2 chooses style, character, location, and emotion modules.
3. AI Director reads `prompt_fragments` from the chosen modules.
4. AI Director combines product facts, module fragments, platform requirements, and storyboard context.
5. A backend AI service may later receive the assembled prompt.

Important: API credentials and provider calls must remain outside the static frontend. The Knowledge Engine only stores reusable creative data.

## 4. How Creative Search Will Use Keywords

Creative Search can index `keywords`, `name`, and `description` from each JSON module. A user search such as `premium cafe creator` could match:

- `styles/luxury.json`
- `locations/cafe.json`
- `characters/female_creator.json`
- `emotions/premium.json`

Search results can then recommend compatible modules through `related_modules`.

## 5. How Future Libraries Can Be Added

Future libraries should be added as JSON files inside the relevant namespace:

```text
knowledge/
  cameras/
  lighting/
  platforms/
  typography/
```

Rules for future modules:

1. Keep each module small and reusable.
2. Use stable lowercase IDs with a category prefix, such as `camera_orbit_closeup`.
3. Include useful search keywords.
4. Keep prompt fragments short and composable.
5. Use `related_modules` for recommendations, not hard dependencies.
6. Do not put API keys, customer data, or product warehouse records in Knowledge Engine JSON.

## 6. Why This System Must Stay Separate From `app.js`

`src/app.js` currently powers existing workflows such as Product Discovery, Product Queue, Content Generator, Image Queue, Settings, CSV import, and Supabase reads. The Knowledge Engine must stay separate because:

- It prevents Creative Studio V2 planning data from bloating the current app bundle logic.
- It avoids breaking completed Product Command Center behavior.
- It lets creative libraries scale independently from UI and routing code.
- It makes modules portable to backend services, Supabase Edge Functions, or future AI orchestration layers.
- It keeps prompt vocabulary auditable as data rather than hidden inside rendering functions.

Creative Studio V2 should consume these JSON modules through a future data-loading layer instead of hardcoding module contents into `src/app.js`.

## Current Library Namespaces

```text
knowledge/
  content_formats/
  styles/
  locations/
  characters/
  emotions/
  motions/
  cameras/
  lighting/
  color_grading/
  audio/
  transitions/
  graphics/
  typography/
  platforms/
```

## Current Seed Modules

- `styles/luxury.json`
- `styles/minimal.json`
- `styles/viral.json`
- `characters/female_creator.json`
- `characters/family.json`
- `characters/expert.json`
- `locations/beach.json`
- `locations/cafe.json`
- `locations/studio.json`
- `emotions/trust.json`
- `emotions/premium.json`
- `emotions/fun.json`

Placeholder `_placeholder.json` files keep future namespaces present in version control until full libraries are added.
