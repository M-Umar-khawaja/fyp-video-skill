---
name: creating-fyp-videos
description: Produces award-quality Final Year Project (FYP, capstone, senior design, thesis) videos end to end, including design-expo pitch videos, muted booth explainer loops, project demo videos and narrated presentation videos, for any engineering or computing domain. Interviews the student for their report, diagrams, specs, code and results; researches the project and its domain; designs a storyboard and visual system from the project's own identity; scripts natural narration (Google AI Studio Gemini TTS, the student's own voice, or local TTS); builds word-synced motion graphics in Remotion with captions, music and sound effects; then renders, masters and verifies the MP4s. Use whenever someone wants a video, pitch, demo, expo, explainer, trailer or presentation video for a final year project, capstone, FYDP or university showcase, even if they only share a report or poster and say "make a video for this".
---

# Creating FYP videos

Turn a student's project material into a video that a mixed judging committee understands in one viewing and remembers afterwards. The approach comes from a real expo video that worked: the project's own diagrams redrawn as clean vector motion graphics, a natural AI narrator, every animation cue landing on its spoken word, honest labelling of what is built versus planned, and a strict verification pass before delivery.

The student should do as little as possible: answer a few questions, hand over files, paste a script into a free voice tool, and say yes to a design. You do everything else.

## The eight phases

Copy this checklist into your task list and keep it current:

```
- [ ] 1 Intake: collect materials, identify domain, ask for what's missing, settle rules and specs
- [ ] 2 Understand: read everything, research the domain, write the fact sheet and claims ledger
- [ ] 3 Craft research: check current judging expectations and current Remotion practice
- [ ] 4 Design: concept, visual system, storyboard, script; self-critique; student approves
- [ ] 5 Voice: student picks a voice path; takes arrive; transcribe and check every word
- [ ] 6 Build: Remotion project, timeline from word timestamps, scenes, stills review loop
- [ ] 7 Render: chunked render, loudness and colour mastering, caption/clean variants
- [ ] 8 Verify and deliver: QA checklist passes, files and a short report handed over
```

`<skill>` below means this skill's own folder (where this SKILL.md lives); scripts run from the video project folder unless stated otherwise.

Two gates need the student: approval of the design (end of phase 4) and the voice takes (phase 5). Everything else proceeds without waiting. While the student is busy (recording, gathering files), keep working on whatever doesn't depend on them, such as building scenes against a scratch voice.

---

## Phase 1 · Intake

Read [references/intake.md](references/intake.md) now. It has the opening questions, the universal materials list, and how to ask with the fewest round trips.

1. **Take whatever the student gave you first** (report, poster, slides, repo link, a paragraph) and skim it before asking anything. Never ask for something you were already given.
2. **Identify the domain** (VLSI/hardware, embedded/IoT, software/web/mobile, AI/ML, networking/security, robotics/mechatronics, power/electrical, mechanical/civil, biomedical, or a mix), then read the matching section of [references/domains.md](references/domains.md). It lists the inputs that make videos in that domain strong and the visuals judges expect.
3. **Ask once, in a single batch**, for: the video type and length limit, the official rules or rubric, the deadline, and the domain-specific materials still missing (diagrams, spec files, implementation files, results, screenshots or screen recordings, logos, team and supervisor names). Use the AskUserQuestion tool where available for choices, and a plain checklist for files. Mark each item *essential* or *nice to have* so the student knows what matters.
4. **Confirm the project's stage.** "Proposal / in progress / finished" decides tense and which claims are allowed (see the claims ledger in phase 2). Getting this wrong is the most damaging error a project video can make.
5. Write `brief.md` in the working folder: video type(s), duration cap, audience, deadline, stage, materials received, materials missing, constraints. Show it in a few lines and continue; don't wait for a reply unless something essential is missing.

**Default video types** when the student doesn't know (details in [references/storytelling.md](references/storytelling.md)):

| Type | Length | Purpose |
|---|---|---|
| Expo pitch | 2:00–3:00 (stay under any cap by ≥5 s) | Main submission; poster QR code |
| Booth loop | 0:60–1:30, seamless loop | Plays muted at the stand; must work without sound |
| Demo video | 3–6 min | Finished project working: real footage plus explanatory graphics |
| Presentation video | 6–15 min | Narrated walkthrough replacing a live talk |
| Teaser | 0:30–0:60 | Social media or opening slide |

## Phase 2 · Understand the project

Read [references/research.md](references/research.md).

1. Read **every** supplied file fully, including diagrams (view the images), code entry points, spec tables and result logs. Projects are full of details the report glosses over, and those details make the best visuals.
2. Research what you don't already know about the domain: the standards, algorithms or physics the project relies on, and how experts usually draw them. Use web search when available. Prefer primary sources (standards, datasheets, papers, official docs).
3. Produce three files:
   - `fact-sheet.md`: one page explaining the problem, approach, architecture, results and impact in plain language, with every number sourced to a file and page/section.
   - `claims-ledger.md`: every number or claim that may appear on screen, tagged **measured**, **simulated**, **target/estimate**, **planned**, or **background (cited)**. Only ledger entries may appear in the video. The tag decides the wording ("achieves" vs "targets" vs "will").
   - `glossary.md`: acronyms and names with how they are said aloud (e.g. "RISC-V → risk five", "ML-KEM → em-el kem"). The voice script and captions both rely on it.
4. If something important is contradictory (two different clock speeds, a bus named differently in report and poster), ask the student which source is current. Don't guess.

## Phase 3 · Craft research

Spend this effort proportionally: a quick check, not a literature review.

- Search for the student's actual event: its rubric, length limit, format, and any past winning videos. Judges score against the rubric, so the script should hit each criterion explicitly.
- Check the current Remotion version and API notes if anything in [references/remotion-build.md](references/remotion-build.md) seems out of date. If the official Remotion agent skill is installable (`npx remotion skills add` inside a Remotion project), install it for authoritative API details.
- Read [references/visual-design.md](references/visual-design.md) before designing. It holds the motion grammar, scene archetypes and the anti-"AI slideshow" rules that made the reference video work.

## Phase 4 · Design the video

Read [references/storytelling.md](references/storytelling.md) and [references/visual-design.md](references/visual-design.md).

1. **Concept.** One sentence plus one visual idea that carries the whole video (for example: "the poster comes alive: one continuous diagram the camera flies through"). It should come from the project itself, not a generic tech aesthetic.
2. **Visual system** from the project's own identity: the poster/report colours, fonts, logo and diagram style. Assign each colour one meaning and keep it all the way through (e.g. amber = targets only).
3. **Storyboard** in `video-design.md` using [assets/storyboard-template.md](assets/storyboard-template.md): scene id, time slot, narration, picture, on-screen text, sound, and which ledger facts it uses. Plan 3–5 "applause moments": visual payoffs where an abstract idea becomes obvious.
4. **Script** at about 140–150 spoken words per minute, leaving 5–10 % slack under the cap. Write for the ear: short sentences, one idea each, numbers said the way people say them.
5. **Self-critique loop.** Score the draft against the rubric in [references/storytelling.md](references/storytelling.md#review-rubric) as a sceptical judge from outside the field would. Revise until every line scores well, at least twice. Common fixes: cut jargon from the first 20 seconds, add a concrete example, make the payoff visual instead of spoken.
6. **Approval gate.** Show the student the concept, the scene table and the full script, plus three style-frame stills if the build is far enough along. Wait for approval or changes. This is the cheapest point to change direction.

## Phase 5 · Voice

Read [references/voice.md](references/voice.md). Offer the three paths with honest trade-offs, recommending the first:

1. **Google AI Studio (Gemini TTS).** Free, natural and expressive; about 15 minutes of the student's time. Give them the copy-paste voice sheet built from [assets/voice-sheet-template.md](assets/voice-sheet-template.md): exact clicks, a style line, script blocks spelled for pronunciation, file naming, and a listening checklist.
2. **The student's own voice.** The most authentic option, which judges reward. Give recording tips and the same script blocks.
3. **Local TTS generated here.** No effort for the student, but it sounds noticeably more synthetic. Use the best engine available (see voice.md) and say plainly that it will sound robotic compared with option 1.

Don't wait idle for takes: build the animatic on a scratch voice (local TTS) and retime when the real takes arrive. When takes arrive, transcribe them (`scripts/transcribe.mjs`) and compare against the script word for word: missing words, misread names, pause tags read aloud, and pace. You cannot listen, so this transcript check is your ears; tell the student exactly which line to regenerate if needed.

## Phase 6 · Build

Read [references/remotion-build.md](references/remotion-build.md). Then:

1. Run `node <skill>/scripts/check_env.mjs` for Node, disk, RAM, Chrome and Python. Low disk or RAM changes how you render (see [references/troubleshooting.md](references/troubleshooting.md)); find out now, not at hour three.
2. Create the project with `node <skill>/scripts/init_project.mjs <folder>`. It copies the Remotion template and the helper scripts, then you run `npm install` there.
3. Put takes in `public/audio/voice/takes/`, then run `node scripts/transcribe.mjs` to get word timestamps (`scripts/words.json`).
4. Write `video.spec.json` (scenes, captions, cue anchors as spoken phrases) and run `node scripts/build_timeline.mjs`. It produces `src/data/timeline.json` and `.srt` files. **Every animation cue is anchored to a spoken phrase**, so the picture lands on the word even after takes change.
5. Run `python scripts/audio_tools.py` to clean and level the voice and to synthesize an original music bed and sound effects. Licensed tracks are optional and must be royalty-free.
6. Write one component per scene in `src/scenes/` using the template's kit (boxes, wires, tiles, tags, camera). Draw the project's real diagrams as vectors; never invent architecture.
7. **Stills review loop.** This step makes the result good. Render stills at the key cue times (`node scripts/stills.mjs <Composition> t1 t2 …`), look at every image, and fix overlaps, clipped text, timing (objects appearing before their word), unreadable sizes and empty frames. Repeat until a full pass finds nothing. Expect 3–5 passes. Clean up `%TEMP%`/`/tmp` `remotion-*` bundles between passes when disk is tight.

## Phase 7 · Render and master

`node scripts/render.mjs <Composition> <output.mp4>` renders in resumable 15-second chunks, joins them, muxes the audio and masters the result: −16 LUFS integrated, −1.5 dBTP, BT.709 limited range, AAC 48 kHz, fast-start. Render a captioned and a clean variant. On a machine with plenty of disk and RAM, a single-pass `npx remotion render` followed by `scripts/master.mjs` is fine too.

Render one video at a time. Parallel renders exhaust RAM and disk on student laptops.

## Phase 8 · Verify and deliver

Run `node scripts/qa.mjs <file.mp4> --max <seconds>`, then work through [references/verification.md](references/verification.md): duration under cap, frame count, loudness, no black or frozen stretches, captions in sync, frames sampled from the final file (not the preview) and inspected, every on-screen number in the claims ledger, names spelled right, and credits present.

Deliver:
- the MP4s (captioned, clean), `.srt` files, and the editable project folder
- a short report: what each file is for, what was verified, what the student must still check by ear (pronunciation, sync), and how to change a line later
- an offer to delete build tooling (`node_modules`, caches) if the student needs the disk space back

---

## Principles that matter most

- **Truth over hype.** A finished-looking video of an unfinished project is a liability in Q&A. Label targets as targets, plans as plans, simulations as simulations. Use only claims-ledger facts.
- **The project's own identity, not a tech aesthetic.** Its colours, its diagrams, its module names. No glowing circuit boards, particle networks, hooded hackers or stock 3D chips.
- **One idea per spoken phrase.** Highlight one thing; dim the rest. Hold each payoff 0.5–1.5 s.
- **Cues on words.** Animation is driven by the narration's timestamps, not by guessed scene times.
- **Readable on a projector and a phone.** Labels ≥ 24 px at 1080p (prefer 28+), sentence captions in the lower fifth, nothing important within 96 px of the edge.
- **Verify what you deliver.** Inspect frames pulled from the final MP4. The preview is not the product.

## Reference files

| File | Read when |
|---|---|
| [references/intake.md](references/intake.md) | Phase 1: questions, materials checklist |
| [references/domains.md](references/domains.md) | Phase 1–4: domain-specific inputs, visuals, pitfalls |
| [references/research.md](references/research.md) | Phase 2: fact sheet, claims ledger, glossary formats |
| [references/storytelling.md](references/storytelling.md) | Phase 4: structures per video type, script rules, review rubric |
| [references/visual-design.md](references/visual-design.md) | Phase 3–6: visual system, motion grammar, scene archetypes |
| [references/voice.md](references/voice.md) | Phase 5: AI Studio steps, own-voice tips, local TTS, take QC |
| [references/remotion-build.md](references/remotion-build.md) | Phase 6–7: project layout, spec format, scene code patterns |
| [references/verification.md](references/verification.md) | Phase 8: QA checklist and delivery report |
| [references/troubleshooting.md](references/troubleshooting.md) | Any failure: disk, RAM, fonts, Chrome, whisper, ffmpeg |
