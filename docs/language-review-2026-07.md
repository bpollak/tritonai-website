# Language review, July 2026

A review of the copy across the TritonAI site, the patterns that made it read as
machine-written, and what changed. The rules this produced are in
[voice and language](voice-and-language.md); the automated part of them runs as
`npm run test:language`.

## What prompted it

The site has two layers of copy with visibly different voices.

The **legacy pages** in `src/site/`, crawled from the old production site and written by
UCSD staff, sound like a person:

> Struggling to articulate your impact for this year's appraisal? Our new AI-Powered
> Self-Appraisal Guide is now available to help.

> Spread awareness of AI by leveraging one of our virtual backgrounds during your Zoom
> meetings.

The **repo-authored pages** in `content/pages/` and `content/use-cases/` did not:

> A practical path from first prompt to trusted service

> TritonAI brings together a campus assistant, approved tools, learning, developer services,
> and human-supervised solutions for recurring university work.

> Useful on day one. Governed for what comes next.

A regex scan across the 25 repo-authored files found **163 marker hits**: 94 triadic or
longer comma lists, 25 booster adjectives, 23 em dashes, 17 antithesis constructions, 3
two-sentence headings, 1 "designed to". Every one of the 14 landing pages used the same
kicker-plus-aphorism section pattern.

## The seven patterns

### 1. Enumerate-then-list headings

The heading announced a count the cards below already made obvious. Six instances.

| Page | Before | After |
|---|---|---|
| TritonGPT | Four ways TritonGPT helps | What you can do in TritonGPT |
| TritonGPT | Three useful patterns | How people use it |
| Tools | Five campus access paths | Supported AI services |
| Trust | Three parts work together | The three parts |
| Learn | Three ways to keep building skill | Keep building |
| DSMLP | Two ways in | Web or command line |

`Six principles` on the strategy page was kept. It is the name of the framework rather than
a count of the cards, and now carries a `lang-ok` marker recording that decision.

### 2. Aphoristic headings

The kicker already labelled the section; the heading then restated it as a maxim. This was
the most pervasive pattern — present on all 14 landing pages.

| Page | Before | After |
|---|---|---|
| Home | Useful on day one. Governed for what comes next. | Start with chat, grow into a supported service |
| About | Share the foundation. Focus on the result. | Departments build on shared services |
| About | The architecture carries the policy | What sits around the model |
| About | The decisions stay connected | What we weigh when we build a service |
| About | Impact means more than adoption | Counting users is not enough |
| Build | A narrow prototype is the beginning, not the finish line | What a prototype needs before it becomes a service |
| Build | The platform and the department own different parts of the result | Who owns what |
| Trust | Trust comes from the whole service—not just the model | What we check before a service ships |
| Trust | One foundation can support many kinds of service | Where you actually meet it |
| Learn | Build judgment, not just prompting technique | Learn how to check what the model gives you |
| Learn | A durable learning loop | How people build the habit |
| Pathways | Every learning format should work for every learner | Accessible formats |
| TritonGPT | Model flexibility without fragmented governance | Where the models actually run |
| DSMLP | DSMLP provides computing. The TritonAI gateway provides model access. | How the two differ |

### 3. Antithesis

"X, not Y", "rather than", "instead of". Seventeen instances, kept where the contrast was
genuinely the point and removed everywhere else.

| Before | After |
|---|---|
| Evidence, not activity | How we measure |
| Bring a problem, not a product request | Tell us about the task |
| Treat output as material to review—not authority to accept | Check what the model gives you before you use it |
| Discovery, not a delivery commitment | Discovery only; no delivery commitment |
| ...instead of adding avoidable steps | ...so nobody has to learn a new system to get the benefit |

The roadmap status gloss is worth calling out: the replacement now matches the wording in
[content governance](content-governance.md) exactly, so the two documents agree.

### 4. Long comma lists

Ninety-four instances of three or more items in one sentence, often stacking abstractions
of different kinds.

> **Before:** Approved model routes, knowledge sources, evaluation, accessibility, service
> ownership, human review, and operational monitoring surround the model itself.
>
> **After:** The model is one piece. Around it sit the routes it can call, the campus
> sources it can read, the accessibility and evaluation checks it has to pass, and the
> person answerable when it gets something wrong.

> **Before:** Useful AI practice combines clear requests, strong source material,
> verification, data awareness, accessibility, authorship expectations, and the confidence
> to stop when a task needs a person.
>
> **After:** Getting good at AI is mostly judgment. Write a clear request, give it the right
> source material, check the answer against something you trust, and know when the task
> needs a person instead.

### 5. Booster adjectives

Twenty-five instances of `practical`, `trusted`, `meaningful`, `thoughtful`, `durable`.
Most often the product name was more precise than the adjective — "a trusted campus
assistant" is just "TritonGPT".

The governance vocabulary was deliberately left alone. `approved`, `bounded`, `supervised`,
`named owner`, and `data classification` all qualify real controls, and several are
validated. Stripping them would have cost the site meaning, not padding.

### 6. Em dashes as a rhetorical beat

Twenty-three instances. Kept for genuine asides and numeric ranges (`120 min to 11 min`),
removed where the dash staged a reveal. Frontmatter `description` fields now take no em
dash at all, since a dash in a search-result snippet is always decoration.

### 7. Repeated syntactic frames

The clearest tell, and the one a reader notices without being able to name it. **Nine of
eleven** use-case summaries opened with the same noun-phrase template:

> **A** guided discovery **workflow that** turns an idea into a scoped use case…
> **A** drafting **workflow for** organizing approved faculty activity data…
> **A** supervised **workflow that** compares contract language…
> **A** review **assistant that** checks dissertation formatting rules…
> **An** assistive **workflow that** identifies common document-accessibility issues…

Nobody writes eleven descriptions this way. All eleven now lead with the person or the
action, and vary their construction:

| Use case | After |
|---|---|
| Contract Review | Procurement staff get contract language compared against approved UC legal positions, marked up and ready for a qualified reviewer. |
| BioBib | Faculty pull approved activity data into a BioBib draft, then check every section before it goes anywhere. |
| Class Planner | Students say which courses they need and when they cannot meet, and the assistant drafts a schedule without conflicts for them to review. |
| Transcript Matching | Matches incoming transcripts to student records, scores its own confidence, and sends the uncertain ones to staff. |
| Passport App | Visitors check themselves in at UC San Diego Passport Services while staff run the queue from a shared dashboard. |

This was the highest-leverage change on the site: `summary` renders in three places at once
— the use-case page lede, the page's meta description, and the index card.

Five of the fourteen page `description` fields opened with "How TritonAI…" or "How UC San
Diego…". Those were varied too.

## What changed

| Area | Files |
|---|---|
| Landing pages | 14 in `content/pages/` |
| Use cases | 11 in `content/use-cases/` |
| Generated section copy | ~20 strings in `scripts/build.mjs` |

Marker count in `content/pages/` and `content/use-cases/` went from **163 to 0**, with one
recorded exemption.

## What was deliberately not changed

- **Numbers and their scope qualifiers.** Every quantitative claim, its `measurementPeriod`,
  `owner`, `source`, and `dataClassification` are byte-identical. The scope qualifiers
  ("in the reported workflow", "in the validation sample", "of respondents") are the part
  doing the work in those sentences, and a tightening pass is exactly how they get lost.
- **The five status words**, which are contractual and validated against an allow-list.
- **`lastReviewed` dates.** A wording change is not a content review, and bumping them all
  to one date would reset the freshness clock across the whole corpus at once.
- **Structure.** No `id`, `aria-labelledby` target, heading level, `alt` text, or
  `AGENT_SECTION` marker changed. `validate.mjs` asserts element counts and section id
  order on the home, strategy, trust, build, and pathways pages; all still pass.
- **`content/skills/library.json`**, synced from an external repository.
- The dead `src/site/` files the build overwrites.

## Still outstanding

Two things fall outside the scope agreed for this pass and are worth a follow-up.

1. **`content/home/hero.json`** is the first thing anyone reads on the homepage, and still
   says *"TritonAI: Campus AI, built right"* over *"Use trusted AI, build governed
   solutions, and learn practical skills through one UC San Diego ecosystem."* That is a
   booster stack and a triadic list in the most prominent position on the site. The
   surrounding hero copy has been rewritten; this slide has not.

2. **`content/newsletters/`** carries the same markers and is regenerated weekly by an
   agent — *"cleaner drafts in Word, sharper analysis in Excel, richer presentations in
   PowerPoint"*, *"strengthening, not replacing, the teaching process"*. The archived
   issues are arguably a historical record and were left alone, but future ones now inherit
   the rules through the Voice section in `AGENTS.md`.

One unrelated observation, noted rather than fixed: `scripts/build.mjs` hardcodes
*"Usage rose to a six-month high in June."* next to data that lives in
`content/facts/gateway-usage.json`. It is correct today and will silently go stale on the
next data refresh. It should be derived from the JSON or moved into it.
