# TritonAI Harness training

The Harness course is a standalone learning experience. Keep its chapter player,
narration, captions, knowledge checks, and practice kit together. The short
capability video on the Harness overview introduces the product; the course
teaches people how to use it.

## Entry points

- `/developer-apis/harness.html#harness-training`: a dedicated training section
  directly below the capability video, with an introductory shortcut above it.
- `/developer-apis/start.html#verify`: the next action after installation and a
  successful first prompt.
- `/training-resources/pathways.html`: a course listing alongside other training.
- `/`: a featured course near the top of the homepage.
- `/training-resources/index.html`: a featured course before the role pathways.
- `/developer-apis/index.html`: links in the Harness client card and setup actions.
- `/tools/index.html`: a training link on the Harness service card.
- `/developer-apis/citizen-developer.html`: an Essentials starting point before connected-tool exercises.
- `/skills/index.html`: a link beside the introduction to using skills.
- `/developer-apis/harness-release-notes.html`: a training link after the release history.

The production course is at `https://tritonai.ucsd.edu/training/harness/`.
These entry points link directly to `/training/harness/`. The course has its own
chapter player and layout, with navigation back to the Harness overview and setup.
It is listed in the public route manifest and sitemap. Do not embed the whole
course in an iframe; its controls, chapters, downloads, and keyboard navigation
need their own space.

## Handoff from the setup walkthrough

The three-minute setup walkthrough on `/developer-apis/start.html#setup-video`
ends where the course begins: the learner has an access key, the Harness
installed, and a first response in Supervised mode. The walkthrough links to
`/training/harness/#essentials`, which turns on Essentials only. The course's
opening notes, the chapter 1 practice box, and the "Before you start" card use
the walkthrough's five steps and wording (access key, one-time link, Build ›
Get Started). Keep the two in step when either changes.

The plugin catalog below the player (`CAT`) is generated from the plugin
manifests pinned to the current stable release. Since the November 2026
re-record (the `v23` block), the plugin chapter screens draw from `CAT` too.

## November 2026 re-record (stable 0.4.2)

Seven narration clips were re-recorded with the same voice and settings as the
rest of the course: 01-02, 07-02, 07-06, 08-01, 08-05, 09-04, and the new
09-07. Each was transcribed and compared with its caption. Step timings in
`VO_DUR` follow the new clip lengths. The working files (script lines, takes,
cleaned clips) are in `~/harness-training-demo/v23-rerecord/` on the work Mac;
the video kit's source page there was not updated, so rebuild from the site
copy, not from the kit, until the two are reconciled. Real captures outside the
plugin chapters, and the Skills chapters, are still from the earlier version.

## November 2026 visual update (stable 0.4.2)

The `v24` block replaces the drawn screens in chapters 2 to 6 and 10 to 12 with
real captures from stable 0.4.2 (`shots/*.jpg`, shown through `S.real`), and
shows each run's output in the preview pane: the summary, the generated deck,
and the sign-up page branded with the UCSD Decorator skill. Sixteen more clips
were re-recorded where controls moved (mode menu, approval buttons, Settings
sections, Decorator skill, nine AI Team skills), and step 06-07 on Ideas and
Help is new. Working files: `~/harness-training-demo/v24-rerecord/` (narration)
and `~/harness-training-demo/stable-0.4.2/rec/` (captures and `INDEX.md`).

Captures were taken from an isolated copy of the app with a fictional project.
The computer name, local paths, and the access key tail are masked in the
published images. Computer use, PowerPoint, Excel, and connected-plugin scenes
still use the earlier captures.

## November 2026 plugin screens, plugin runs, and "Find your way around" (stable 0.4.2)

The `v25` block does three things.

In the plugin chapters it replaces the drawn Settings screens with real 0.4.2
captures of the Plugins page and the Microsoft 365 and n8n plugin pages, taken
signed in. Two steps whose narration says the write switches are off (Google
Workspace and Kuali Build) use captures taken before sign-in, cropped to the
ability list, because the signed-in copy had those switches on or did not show
that list. Narration in those steps is unchanged.

It replaces earlier embedded screenshots with real 0.4.2 runs: a read-only
GitHub pull request review, the n8n plugin explaining the demo workflow, and
connecting the sign-up page to that workflow. "Put it to work" opens with a
real Microsoft 365 run that reads one public newsletter (steps 11-02 and
11-03), ahead of the sample-data briefing, calendar, and draft examples, and
the use case library has a matching "Summarize one email" card. Step 12-06 was
re-recorded to say what that run reports.

It adds chapter 7, "Find your way around", after "Settings you'll use": eleven
steps on the composer selectors and dictation, Search and the project
overview, Ideas and Help, the preview pane, recording a skill, UC San Diego
sign-in, and Memory, with a practice box and a knowledge check. It is written
for someone seeing the workspace for the first time.

Audio ids follow chapter and step position, so the added chapter moved every
later chapter up by one (`07-xx` became `08-xx`, and so on) and the two added
Microsoft 365 steps moved the rest of chapter 11 down by two. `VO_DUR` has the
matching entries. Progress saved in a browser is keyed by chapter position, so
a returning learner's check marks from chapter 7 onward shift by one. Working
files: `~/harness-training-demo/v26-rerecord/` (narration).

## November 2026 skills and approval screens, and a steady stage (stable 0.4.2)

The `v26` block replaces four more drawn steps with real 0.4.2 captures: the
plugin write approval in "Connect campus tools" (08-08), and all three steps of
"Use and share skills" (14-01 to 14-03): the Community list and Add From Link,
Your Skills with Share with UCSD, and calling a skill from the composer with
`$` or the slash menu. The approval is a real `n8n_update_workflow` prompt
against the TRAINING DEMO workflow; the workflow id is replaced with an example
value, and local paths under Your Skills are shown from `~`.

Three clips were re-recorded: 08-08 (the approval now shows a change to a
workflow, with Decline and Approve, and Always allow this session in the menu
beside them), 10-07 (Jira, Lucid, and UCSD Assistant are described as they are,
without calling them newer), and 14-02 (Your Skills lists every skill installed
on the computer, including the ones that come with plugins). `VO_DUR` has the
new lengths. The card that opens "Build an app, connect n8n" now reads Part 4,
and the course says "preview pane" wherever it used to say "Browser surface".
Working files: `~/harness-training-demo/v27-rerecord/` (narration) and
`~/harness-training-demo/stable-0.4.2/rec/r3/` (captures).

Still drawn, with sample data: the Google Sheet and Doc examples (09-06, 09-07),
the calendar hold and mail draft (11-07, 11-08), the briefing (11-04, 11-05),
and Kuali Build (11-12, 11-13). The Microsoft 365 write abilities need the
account owner to finish a device-code sign-in before they can be captured, and
there is no sample Drive file or Kuali Build app to show without real content.

When a step replaces a drawn screen with a capture, keep running the drawn
step's own `do` underneath (the `R` helper in `v26` does this). Later drawn
steps rely on the window state the earlier ones leave behind.

Steps with a `zoom` used to scale `#stage` itself, so its box grew past the
16:9 screen (up to about 930 px tall at a 1440 px window, against 641 px). The
zoom now moves a camera layer inside the stage (`#cam`), and `#stage` keeps one
size on every step. Anything appended to the stage goes into that layer.
The caption bar reserves room for three lines, so the controls under the
screen stay put between steps with short and long captions.

## Standalone course contract

The content owner authorized the standalone layout. Only this course is added to
the existing standalone-route exclusions in the chrome checker and validator;
all normal website routes retain the Decorator contract. Standalone routes and
unlisted routes are distinct: the training is standalone and publicly listed.

The course has a main landmark, skip link, canonical URL, narrated captions, and a
readable transcript with visual descriptions. Recorded app screens are inert and
hidden from assistive technology; the transcript and caption player provide the
text alternative. Reduced-motion settings disable decorative motion. The quiz's
next-chapter button stays hidden until the correct answer is selected.

`npm run test:harness-training` exercises desktop and mobile playback, caption
text, chapter selection, knowledge-check feedback, transcript access, skip-link
focus, audio and practice downloads, overflow, and axe checks. It runs within
`npm test`; normal routes continue to receive the full site-wide accessibility
gate. The course owns its typography, so Decorator font assertions apply to the
normal website routes rather than the standalone course.

The deployed course files originate from playground commit
`6dc234e` (v22: one running project scenario, campus tools first, five-question requests). Only
`src/site/training/harness/` was promoted; unrelated playground content was not
merged. Audio and practice-kit links remain relative, supporting both host modes.

## Release and upkeep

Use playground for course revisions and review. Run the site's required tests in
both base-path modes, then promote the reviewed course to preview and production
through the existing branch-driven Cascade release path. Verify the actual
production player, an audio segment, a caption, a knowledge check, and the
practice ZIP after publication.

Publish a revision date and the demonstrated Harness version in the course.
Review the course when installation, permissions, plugin connections, or skills
change. Re-record affected chapters and their narration together; preserve the
stable course URL. Do not schedule automatic narration or publish unreviewed
training changes.

Avoid using the playground deployment as the permanent address for campus-wide
announcements. Once the production course is verified, use its stable URL in
onboarding messages, workshops, and any future in-app help link. Those additional
communications and app changes are separate work from the website entry points.
