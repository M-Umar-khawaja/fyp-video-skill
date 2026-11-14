# <Project>: voice guide for Google AI Studio (Gemini TTS)

You generate the voice in Google AI Studio (free, about 15 minutes). I clean it, align the animation to every word, and mix it with music.

Three rules from Google's speech-generation docs:
- The script box is a **verbatim transcript**: anything typed there is spoken. Directions go in the **style** field, never in the script.
- Keep **one short style line**, identical for every take.
- Pauses use angle-bracket tags `<short pause>` and `<long pause>`. Two tags never touch.

---

## Step 1: Open the speech playground
1. Go to **aistudio.google.com** and sign in with a Google account.
2. Open the speech generation page (look for **Generate speech**, or under *Generate media*).
3. Pick the newest **Flash TTS** model (not "Lite"), **single speaker**. Leave temperature at its default.

> The layout changes often. If something moved, look for the same names: *model*, *voice*, *style*, and the *text/script* box.

## Step 2: Pick the voice (10 minutes, worth it)
Paste this **test line** with the style field empty, and try each voice:
```
<one sentence containing the hardest names and acronyms, spelled for speech>
```
Try first: **<Voice 1>** (<label>), **<Voice 2>** (<label>), **<Voice 3>** (<label>).
Pick the one that sounds like **a confident engineer explaining their own project to a smart friend**. Then use that one voice for every part.

## Step 3: Set the style line
Paste into the **style** field and keep it identical for every take:
```
calm, warm and confident narration, unhurried and conversational
```
Too fast → `…, speaking slowly`. Too flat → `warm, quietly enthusiastic narration, unhurried`. If there's no style field, leave it out; never put it in the script box.

## Step 4: Generate the parts
Paste each block **exactly as written**. Odd spellings are deliberate pronunciation guides (captions use the normal spelling). Make **2–3 takes** of each part and download them as **WAV**.

**File names:** `<Video>_P1_take1.wav`, `<Video>_P1_take2.wav`, …
**Put them in:** `<project>/public/audio/voice/takes/` (or just send them to me).

**<Video> · Part 1** (scenes <ids>, ≈ <s> s)
```
<voice-version script block>
```

**<Video> · Part 2** …

## Step 5: Listen before sending
Keep the best take of each part. Regenerate a part if:
- something is mispronounced: change only that spelling, as in the table below
- a tag is read aloud ("short pause"): regenerate; if it repeats, replace the tag with `...`
- it sounds rushed, or the tone changes between parts: same voice, same style line, same model every time

| If it says… | Change the text to… |
|---|---|
| <wrong pronunciation> | <respelling> |

A take doesn't need to be perfect everywhere. "Use take 2 for the first half and take 3 for the rest" is fine; I'll splice them.

---
Notes: output is 24 kHz mono WAV, which I master for you. Gemini audio carries Google's inaudible SynthID watermark; the end card credits "Voice generated with Gemini TTS". Don't paste confidential text into the free tier.
