# Voice

## Contents
- Choosing a path
- Path 1: Google AI Studio (Gemini TTS)
- Path 2: the student's own voice
- Path 3: local TTS generated here
- Script formatting rules
- Checking takes (your ears are the transcript)
- Scratch voice while waiting

## Choosing a path

Present these three options plainly, recommending path 1:

| Path | Sound | Student effort | Notes |
|---|---|---|---|
| 1. Google AI Studio (Gemini TTS) | Natural, expressive | ~15 min, free with a Google account | Recommended |
| 2. Own voice | Authentic; judges like it | 20–40 min plus a quiet room | Best for demo/presentation videos |
| 3. Local TTS generated here | Noticeably synthetic | None | Fine for drafts or as a fallback |

## Path 1: Google AI Studio (Gemini TTS)

Build a personalised voice sheet from `assets/voice-sheet-template.md`. Facts from Google's speech-generation docs (aistudio.google.com/docs/speech-generation) that shape it:
- The script box is a **verbatim transcript**: everything typed there is spoken. Delivery directions go in the separate **style** field, never in the script.
- Point-in-time tags use **angle brackets** inside the script: `<short pause>`, `<long pause>`. Two tags must never touch; put words or punctuation between them. Commas, colons and `...` also create natural breaths.
- Output is a 24 kHz mono 16-bit WAV. The tooling upsamples and masters it.
- Generated audio carries Google's inaudible SynthID watermark. Credit "Voice generated with Gemini TTS" in the end card or description.

Steps to give the student (the UI changes often, so describe controls by name, not position):
1. Open **aistudio.google.com**, sign in, and open the speech generation page (often **Generate speech** or under *Generate media*).
2. Choose the newest **Flash TTS** model (not "Lite") for long-form narration, in **single-speaker** mode.
3. Audition voices with a test line containing the hardest words, with the style field empty. Good narration voices to try first: **Charon** (informative), **Sulafat** (warm), **Sadaltager** (knowledgeable), **Iapetus** / **Erinome** (clear), **Schedar** (even), **Kore** / **Orus** (firm). One voice for all parts and all videos.
4. Paste one style line into the style field and keep it identical for every take, e.g. `calm, warm and confident narration, unhurried and conversational`.
5. Paste each script block (about 30–60 s of speech each, split at scene boundaries), generate **2–3 takes** per block, and download each as WAV.
6. Name files `<Video>_P<part>_take<n>.wav` and put them in the project's `public/audio/voice/takes/` folder (or attach them in chat).
7. Listen for mispronunciations, tags read aloud, rushing, and tone drift; regenerate only the bad block.

Split the script into blocks of about 100–160 words. Shorter blocks keep the voice stable and make re-takes cheap.

## Path 2: the student's own voice

- A quiet, soft-furnished room (a wardrobe full of clothes is a great booth); phone voice-memo app or a USB mic, 15–20 cm from the mouth, slightly off-axis.
- Record each block 2–3 times; leave 2 s of silence at the start (it is used as a noise profile).
- WAV preferred; otherwise the highest-quality M4A/MP3. The tooling cleans and levels it.
- Speak like explaining to a friend, smiling slightly; read the voice version of the script, not the caption version.

## Path 3: local TTS generated here

Use the best engine available, in this order:
1. **Kokoro** (open-source, natural for its size; `pip install kokoro soundfile`, needs ~350 MB and Python 3.10+). Check its current install notes first.
2. **Piper** (fast, offline voices).
3. The operating system voice: Windows SAPI via PowerShell `System.Speech`, macOS `say -o out.aiff`, Linux `espeak-ng` (most robotic).

Tell the student honestly that the result is more synthetic than path 1, and that swapping in AI Studio takes later is easy because the timeline re-aligns automatically.

## Script formatting rules

- Write the **voice version** from the caption version with the glossary: acronyms spelled for speech ("F-P-G-A", "risk five"), numbers in words ("twenty thirty-five", "a hundred and eleven").
- `<long pause>` at scene boundaries, `<short pause>` for dramatic beats. Max one tag per sentence.
- No stage directions, emojis, brackets of other kinds, or headings inside script blocks.
- Keep the caption text and voice text side by side in the storyboard so they can't drift apart.

## Checking takes (your ears are the transcript)

You cannot listen to audio. Instead:
1. Run `node scripts/transcribe.mjs` (local whisper.cpp; first run downloads the engine and a ~150 MB model).
2. Compare each take's transcript with the voice script: missing or extra words, tag words spoken aloud ("short pause"), garbled names.
3. Check pace: words ÷ duration. Over ~165 wpm feels rushed.
4. Check levels with `audio_tools.py`'s report (peak, speech RMS).
5. Whisper mishears names too ("NUST" → "NIST"). When a name looks wrong, ask the student to listen to that exact line rather than assuming the voice is wrong.

Report findings per take: "Part 2 take 1: clean, 61 s, 148 wpm. Part 3: 'chip expert' at 0:55; please confirm it sounds like 'ChipXPRT'."

## Scratch voice while waiting

Generate a quick local-TTS scratch voice from the voice script, run the whole pipeline on it (transcribe, timeline, scenes, stills), and when real takes arrive just replace the WAVs and rerun transcribe → build_timeline → audio_tools. All cues move with the words.
