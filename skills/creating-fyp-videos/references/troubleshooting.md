# Troubleshooting

Student laptops are the usual environment: small disks, 8 GB RAM, Windows. Most failures come from resources, not code.

## Disk full (ENOSPC, "No space left on device", ffmpeg muxing errors)

- Each `bundle()` leaves ~100 MB in the temp folder (`remotion-webpack-bundle-*`, `remotion-v4-assets*`). The scripts clean these up; after a crash, delete them yourself (Windows `%TEMP%`, macOS/Linux `/tmp`).
- Full-length renders need temporary space: audio mixing can use 1 GB+, and an intermediate video ~100–200 MB for 3 min. `scripts/render.mjs` renders in chunks and deletes them as it goes. For a clean twin, `--audio-from` skips the audio render entirely.
- **Windows page file:** during heavy renders Windows grows `pagefile.sys` into free disk space (1–2 GB) and keeps it until a restart. If space "disappears" during rendering, ask the student to restart, close Chrome/IDEs, and try again.
- Ask the student to free space themselves; list the biggest folders you find, but never delete their files without explicit approval.

## Out of memory ("Cannot allocate memory", malloc failures, Chrome crashes)

- Lower `--concurrency` to 2 (or 1).
- Render one video at a time; don't run stills and renders together.
- The master pass already limits x264 (`-threads 4`, short lookahead). If it still fails, close other apps or restart.
- A full disk also causes memory errors on Windows (no room for the page file).

## Browser

- No Chrome installed: Remotion downloads a headless browser on first render (~100–200 MB).
- To use the installed Chrome: set `REMOTION_BROWSER_EXECUTABLE` to its path (`check_env.mjs` prints it). The template and scripts then use `chromeMode: 'chrome-for-testing'`, which modern Chrome needs because the old headless mode is gone.

## Fonts look wrong

- Fallback fonts in stills mean the font didn't load: check the family name, the weight you asked for, and internet access (Google Fonts load at render time).
- Wide display fonts overflowing their slot: see "Text wider than expected" in remotion-build.md.

## Whisper / transcription

- First run downloads whisper.cpp and a model. Network timeouts are retried automatically; if it keeps failing, check whether the network blocks GitHub or Hugging Face downloads.
- On macOS/Linux, `installWhisperCpp` compiles from source and needs `make` and a C compiler (Xcode command line tools / build-essential).
- Garbled names in transcripts are normal ("NUST" → "NIST"). Use the transcript's spelling in cue anchors, or rely on the fuzzy match, and ask the student to listen to that line.
- Non-English narration: `--language <code>` (uses a multilingual model).

## Audio

- `audio_tools.py` needs numpy: `python -m pip install numpy`. On Windows, `python` may be the Microsoft Store stub; try `py`.
- MP3/M4A takes: convert first, e.g. with the bundled ffmpeg (`node_modules/@remotion/compositor-*/ffmpeg -i take.m4a take.wav`).
- Gemini TTS WAVs carry a wrong byte-rate header field; the scripts compute duration from sample rate × channels × bits, so lengths are right.

## ffmpeg capabilities

The ffmpeg bundled with Remotion is a slim build: no `hstack`/`vstack`, no rawvideo muxer, no `blackdetect`. The scripts work within it (for example, `-c:v rawvideo -f image2pipe` for frame analysis). For contact sheets, extract frames individually.

## Render looks different from Studio

- Colours washed out or too dark on some players: the file wasn't mastered. Run `scripts/master.mjs` (converts full-range output to BT.709 limited range).
- Missing sound effects: they are skipped until `audio_tools.py sfx` has generated them.
- Music missing: run `audio_tools.py music` after `build_timeline.mjs`.
