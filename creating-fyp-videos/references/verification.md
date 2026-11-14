# Verification and delivery

Nothing is delivered until it passes this list. Check the final MP4, not the Studio preview: encoding, fonts and audio mixing can all differ.

## Contents
- Automated checks
- Visual inspection
- Content and truth
- Sound
- Delivery report

## Automated checks

`node scripts/qa.mjs <file.mp4> --max <cap seconds> --srt out/<video>.srt` must report no FAIL:
- [ ] H.264, 1920×1080 (or the required format), yuv420p limited range
- [ ] frame count matches duration × fps (no truncated render)
- [ ] AAC 48 kHz stereo; audio and video lengths match
- [ ] loudness −16 ±1 LUFS, true peak ≤ −1 dBTP
- [ ] duration under the cap, with ≥ 5 s spare where the rules are strict
- [ ] no unintended black frames or frozen stretches
- [ ] captions don't overlap and end before the video does

## Visual inspection

Look at every frame `qa.mjs` extracts (`out/qa/<name>/`), plus frames at each applause moment and each cue (extract with ffmpeg `-ss <t>`):
- [ ] no clipped, overlapping or cut-off text; nothing under the caption band
- [ ] every label readable at phone size (imagine the frame at 360 px wide)
- [ ] each visual appears with (not before) its word, and holds after the payoff
- [ ] diagrams match the project's real architecture and names
- [ ] colours keep their meaning throughout (e.g. amber only on targets)
- [ ] fonts rendered correctly (no fallback serif or system font)
- [ ] logos sharp, correct, not stretched; names spelled exactly as the student gave them
- [ ] the clean variant has no captions; the captioned one has them all
- [ ] booth loops: last frame matches the first; the story works with the sound off

## Content and truth

- [ ] every number on screen and in the narration is in the claims ledger
- [ ] status wording is right: measured / simulated / target / planned
- [ ] no claim the team couldn't defend in Q&A
- [ ] credits: team, supervisors, department, institution, partners; voice and music credit if required ("Voice generated with Gemini TTS")
- [ ] no personal data in screen recordings; confidential parts abstracted

## Sound

You cannot hear the result, so check what you can and hand the rest to the student explicitly:
- [ ] transcript of each take matches the script (from transcribe.mjs)
- [ ] music bed ducks under speech (the timeline's caption times drive it) and resolves at the end
- [ ] effects sparse and on their visual events (from the sfx list)
- [ ] student asked to listen once on laptop speakers and once on headphones, for pronunciation, sync and balance

## Delivery report

Keep it short and concrete:

```markdown
**Files** (in <folder>):
| File | Length | Use |
| <Name>_Pitch_captioned.mp4 | 2:55 | Main submission / poster QR |
| <Name>_Pitch_clean.mp4 | 2:55 | Same, no captions |
| <Name>_Pitch.srt | | Captions for uploads |

**Verified:** duration, frames, loudness, captions, frames inspected, every number traced to <source>.
**Please check by ear:** <specific lines, e.g. the pronunciation of the partner name at 2:47>.
**To change a line later:** regenerate that block's take, drop it into public/audio/voice/takes/, and ask me to rebuild.
```

Then offer to remove build tooling (`node_modules`, `whisper.cpp`, `out/_work`, temp bundles) if the student needs disk space, keeping the source and the final files.
