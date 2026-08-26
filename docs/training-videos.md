# Learning video library

The AI learning video library lives at `/training-resources/videos/`. One markdown
file in `content/training-videos/` describes each video; the build generates the
library index, a page per video, and `transcripts.json` for TritonGPT ingestion.

## Add or publish a video

1. Copy any existing entry in `content/training-videos/` and fill the frontmatter.
   `series` groups the library sections (current taxonomy: Foundations, Using the
   tools, and Building; the index renders them in that order no
   matter when videos arrive). `durationMinutes` shows on cards and the detail
   page so people can judge the time commitment before pressing play.
2. Keep `status: Draft` until the recording is ready. Draft entries never render.
3. To publish, set `status: Published` and provide `videoSrc` (MP4), `videoPoster`,
   and `videoCaptionsSrc` (WebVTT). Published entries without captions fail
   validation; this is deliberate. Host media externally per AGENTS.md, or under
   an approved `_resources` path. Optional: `videoChaptersSrc` (a chapters VTT)
   adds in-player chapter markers for longer videos.
4. The page's `## Transcript` section is the fallback transcript. When the
   captions VTT is a repo-local file, the build replaces it with a timestamped
   interactive transcript generated from the cues (each timestamp seeks the
   video), so a separate prose transcript is only needed for externally hosted
   captions.
5. Run `npm test` plus the `SITE_BASE_PATH=/tritonai-website` build and validate,
   then open a focused PR. Presenter names appear only with the presenter's
   approval; keep production-planning details (scheduling, unconfirmed names) in
   the planning sheet, not in this repo.

## Content guidance

Research on instructional video consistently favors short, single-topic videos —
most learners prefer the 3–6 minute range, and completion drops sharply on long
recordings. Where the production plan calls for longer videos, chapters and the
interactive transcript keep them navigable.

## Player behavior

- No autoplay, no muting; playback is user-initiated with native controls
  (speed, captions, keyboard shortcuts included).
- Watch position is stored in `localStorage` on the viewer's device only. A
  "Resume from mm:ss" button appears on return, and the library shows a
  "Continue watching" strip plus per-card watched/in-progress states. No account,
  no server-side tracking of position.
- The validator enforces this contract: training players must not be muted, must
  not autoplay, and must carry a captions track.
- Knowledge checks, discussion points, and the next-video action stay hidden
  until playback completes. Completed videos restore those sections on return.

## Analytics

`video-progress.js` emits GA4 events through the site's canonical Google
Analytics tag, which only collects on the production domain:

- `video_start` — first play per page view (params: slug, title, duration, whether the session resumed)
- `video_progress` — 25/50/75 percent quartiles reached
- `video_complete` — playback finished
- `video_resume_click` — the resume button was used (resume position)
- `video_transcript_seek` — a transcript timestamp was clicked (target position)
- `video_captions_toggle` — captions turned on or off

These support the core usage questions: plays per video, watch time and
completion rates by quartile, where viewers drop off, how much resume and the
interactive transcript are used, and caption usage. Standard GA dimensions add
audience splits (device, referrer) and the search terms that led people to a
video. Read them alongside `transcripts.json`-driven TritonGPT questions to see
which topics need deeper coverage.
