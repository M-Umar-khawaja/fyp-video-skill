# Visual design and motion

What separates a crafted project video from an "AI slideshow" is consistency: one visual world, one motion grammar, the project's own identity, and every movement motivated by the narration.

## Contents
- Visual system from the project's identity
- Layout and readability
- Motion grammar
- Camera
- Scene archetypes
- Sound design
- Never / always

## Visual system from the project's identity

Extract from the poster, slides or report:
- **Colours:** 1 dark background, 1 light background, 1 ink colour, and 2–4 accent colours. Give each accent one meaning and keep it all the way through, e.g. teal = scheme A / data, blue = scheme B / control, amber = targets and estimates only, red = failure or tamper only (use it at most twice).
- **Fonts:** reuse the poster's fonts. If unknown, use a strong condensed sans for titles (Archivo Narrow, Barlow Condensed), a humanist sans for labels (Source Sans 3, Inter), and a mono for numbers or bits (JetBrains Mono). A display face is for the project wordmark only.
- **Logo / mark:** if the project has a mark, build the title reveal from its shapes. If not, a simple wordmark is fine; don't invent a logo without asking.
- **Diagram style:** match the poster's (stroke width, corner radius, arrow heads, solid vs dashed meaning). Redraw diagrams as vectors in this style; never paste screenshots of diagrams.

Define these as tokens in `src/lib/theme.ts` before drawing any scene.

**Two lighting states** work well: a dark "night" state for stakes, title and end card, and a light "blueprint/paper" state with a faint grid for diagrams. Transitions between them should be motivated (a panel sliding down like a poster header, a zoom into a dark block).

## Layout and readability

Sizes at 1920×1080:
- Titles 56–96 px; block labels 26–36 px; minor labels ≥ 20 px (prefer ≥ 24); captions 36–40 px.
- Keep 96 px safe margins for important content; keep the lower fifth (y > 860) clear for captions in every scene.
- Maximum ~12 words of on-screen text at once (excluding diagram labels). The voice carries the sentence; the screen carries the key term or number.
- Measure wide text instead of guessing: display fonts (e.g. Unbounded) can be 30 %+ wider than expected. Clip-reveal widths must come from measured text width.
- Contrast: body text ≥ 4.5:1 against its background.

## Motion grammar

- **One idea per spoken phrase.** Highlight the subject (outline glow, colour fill); dim everything else to ~35 % if the frame is busy.
- **Easing:** entrances use an expo-out curve, `cubic-bezier(0.22, 1, 0.36, 1)`. Camera moves use ease-in-out, `cubic-bezier(0.65, 0, 0.35, 1)`. A small overshoot, `cubic-bezier(0.34, 1.56, 0.64, 1)`, is for small "pop" objects only (keys, ticks, badges). Linear motion is only for things travelling on a wire.
- **Lines draw themselves** (stroke-dash reveal), boxes stroke-draw then fill, text fades and rises 10–20 px. Nothing teleports.
- **Data moves along real paths.** A token (labelled tile) follows the actual wire geometry (`pointAt(polyline, progress)`), never a straight line through boxes.
- **Timing:** entrance 0.4–0.8 s; camera moves 0.9–1.6 s; hold 0.5–1.5 s after each payoff before the next idea.
- **Cues on words:** start each element 0.1–0.3 s before its word so it is fully visible as the word lands. All times come from the timeline cues, never hand-typed seconds.
- **Scene changes:** short cross-fades (0.4–0.5 s) by default; wipes or floods for state changes; a hard cut only when it is the drama.

## Camera

For architecture-heavy projects, draw the whole system once on a large canvas (e.g. 2600×1000 units) and move a virtual camera through it (translate + scale with ease-in-out). Spatial continuity tells the viewer where they are. Use 3–7 camera keys per scene, each tied to a narration cue, and end wide so the viewer sees the whole again. A slow drift (1–2 % scale) during long holds keeps the frame alive.

## Scene archetypes

Reusable patterns. Combine them; don't use them all.

| Archetype | Use for | Notes |
|---|---|---|
| Cold-open scenario | Hook | A tiny story with real objects (packets, patients, cars), not a title |
| Two cards | Two standards, options or modes | Cards drop in on their names; a property line underneath each |
| Problem bar | "Too slow / too big / too costly" | A crawling progress bar, a 2× area bracket, a red cost tag |
| Merge into mark | Reveal | Two outlines slide together and become the logo; a dark flood; wordmark clip-reveal |
| Command assembly | Interfaces, configs | Fields fill in; a grid counts the modes |
| Architecture fly-through | How it works | Big canvas, camera, step chips (①②③) in screen space, tokens on wires |
| Hero macro | The key innovation | Zoom into one block; show its internals; the reconfigure/pack payoff |
| Pipeline / timeline | Latency, stages, schedules | Stages fill; clock waveform; counter lands on the number |
| Heatmap / chart build | Results | Cells or bars build in order; the quoted values get outlined; status tag (Measured / Target) |
| Roadmap | Plans | Branches with milestones lighting on their phrase; a toolchain logo strip |
| Applications grid | Impact | Tiles arrive per phrase, then stream into the mark |
| End card | Credits | Matches the poster header: wordmark, tagline, key stats, institution card with logos, team, supervisors |
| Footage frame | Demos | Screen recording or video in a device or window frame, with zoom callouts and labels |

## Sound design

- **Voice first.** Music sits 18–20 dB under the voice and ducks further under dense explanations.
- **Original synthesized sound** (see scripts/audio_tools.py): soft ticks for steps, a whoosh for camera moves, a click for mode switches, a thunk for failures, a two-note motif for the name reveal and the end. Keep them sparse (one per idea at most) and frame-accurate on the visual event.
- A licensed track is fine if it is royalty-free for this use (Pixabay Music, YouTube Audio Library); note the licence in the credits file.
- Final mix: −16 LUFS integrated, −1.5 dBTP, music fading to silence with the end card.

## Never / always

**Never:** glowing circuit-board or matrix backgrounds · particle "plexus" networks · hooded hackers · stock 3D chips or robots · word-by-word karaoke captions · "epic" trailer music · random zoom punches · letter-by-letter typing for everything · mixed icon styles · claims without numbers · numbers without status.

**Always:** the project's real diagram and names · specific numbers on screen with their status · one motion grammar from start to finish · deliberate holds · sound that lands on the action · captions in sentences, two lines max.
