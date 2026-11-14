# creating-fyp-videos: an Agent Skill for award-quality Final Year Project videos

Give Claude your project report and get back a polished, narrated, word-synced motion-graphics video for your design expo, demo day or final presentation, with as little work on your side as possible.

The skill turns Claude into a small video studio. It interviews you, studies your project and its domain, designs a storyboard in your poster's own visual style, helps you produce a natural AI voice for free, builds the animation in [Remotion](https://www.remotion.dev), and verifies the final MP4 before handing it over.

It was distilled from a real end-to-end build of a design-expo pitch video and booth explainer loop for a VLSI project, and generalised to any engineering or computing domain.

## What you get

- **Expo pitch** (2–3 min), **booth loop** (60–90 s, works muted), **demo video**, **presentation video** or **teaser**
- Captioned and clean MP4s (1080p, H.264, BT.709, −16 LUFS), `.srt` caption files, and the editable source project
- A storyboard, a narration script, a fact sheet and a **claims ledger**, so every number on screen is traceable and labelled honestly (measured / simulated / target / planned)

## How it works

| Phase | What Claude does | What you do |
|---|---|---|
| 1 Intake | Reads what you sent, detects your domain, asks once for what's missing | Answer one batch of questions, attach files |
| 2 Understand | Reads everything, researches the domain, writes fact sheet, claims ledger, pronunciation glossary | (confirm anything contradictory) |
| 3 Craft research | Checks your event's rubric and current best practice | — |
| 4 Design | Concept, visual system from your poster, storyboard, script, self-critique against a judge's rubric | **Approve the design** |
| 5 Voice | Gives you a copy-paste sheet for Google AI Studio (free, natural), or uses your recordings, or local TTS | **Generate the takes (~15 min)** |
| 6 Build | Remotion project; cues anchored to spoken words; repeated stills review | — |
| 7 Render | Chunked, resumable render; loudness and colour mastering | — |
| 8 Verify | Automated QA plus frame inspection, truth check, delivery report | Listen once |

Domains with dedicated guidance: VLSI/FPGA, embedded/IoT, software/web/mobile, AI/ML, networking/security/crypto, robotics, power/electrical, communications/DSP, mechanical/civil, biomedical, business-tech.

## Install

**Claude Code** (personal, all projects):
```bash
git clone https://github.com/M-Umar-khawaja/fyp-video-skill.git
cp -r fyp-video-skill/creating-fyp-videos ~/.claude/skills/
```
Or for one project: copy `creating-fyp-videos` into that project's `.claude/skills/`.

**Claude apps (claude.ai / desktop):** download `creating-fyp-videos.zip` from the Releases page (or zip the `creating-fyp-videos` folder), then add it under *Settings → Capabilities → Skills*. Building and rendering video needs a code-execution environment with Node.js; Claude Code on your own computer is the smoothest experience.

## Use

Just ask, for example:
> Here's our FYP report and poster. Make us a 3-minute video for the design expo.

> We need a demo video of our app for the final evaluation, max 5 minutes. Screen recordings are in /demo.

> Plan a 2-minute pitch for our capstone; storyboard and script only for now.

## Requirements

- Node.js 18+ and ~1.5 GB free disk (4 GB+ comfortable); 8 GB RAM works with the low-memory render path
- Python 3 with numpy (voice cleanup, original music and sound effects)
- Internet for the first run (npm packages, whisper.cpp model, Google Fonts)
- Optional: an installed Chrome (`REMOTION_BROWSER_EXECUTABLE`) to skip Remotion's browser download

## Repository layout

```
creating-fyp-videos/
├── SKILL.md                    the workflow (8 phases, gates, principles)
├── references/                 loaded only when needed
│   ├── intake.md  domains.md  research.md  storytelling.md
│   ├── visual-design.md  voice.md  remotion-build.md
│   └── verification.md  troubleshooting.md
├── scripts/                    check_env, init_project, transcribe, build_timeline,
│                               audio_tools.py, stills, render, master, qa
├── assets/
│   ├── remotion-template/      starter project (Stage, drawing kit, camera, example scenes)
│   ├── video.spec.example.json
│   ├── storyboard-template.md
│   └── voice-sheet-template.md
└── evals/                      test cases (runnable with `claude plugin eval`)
```

## Honesty and licences

- The skill only puts claims from your own documents on screen, and labels targets and plans as such. Judges ask questions afterwards; the video should never promise more than you can defend.
- Gemini TTS audio carries Google's inaudible SynthID watermark; the end card credits "Voice generated with Gemini TTS".
- Music and sound effects are synthesised locally, so there is nothing to license. Remotion is free for individuals and small teams; check [remotion.dev/license](https://www.remotion.dev/license) for company use.

## License

MIT. See [LICENSE](LICENSE).
