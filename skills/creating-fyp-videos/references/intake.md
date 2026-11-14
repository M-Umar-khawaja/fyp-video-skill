# Intake

Goal: in one or two short exchanges, have everything needed to make the video, and nothing the student has to dig for twice.

## Contents
- First look (before asking anything)
- The single batch of questions
- Universal materials list
- How to ask
- brief.md format
- Edge cases

## First look

Before asking, skim what you already have. From a report or poster alone you can usually infer the domain, the stage, the team and supervisor names, the main diagrams, and the key numbers. Only ask about what is genuinely missing or ambiguous. Students notice when you ask for something they already gave you, and it costs trust.

If the student gave nothing but a sentence ("make a video for my FYP on smart irrigation"), ask for their report or poster first. Everything else depends on it.

## The single batch of questions

Ask these together. Skip any you can already answer.

1. **Which video?** Expo pitch / booth loop / demo / presentation / teaser, or "you choose". If they need more than one, plan them as one visual world.
2. **Rules.** Length limit, format (MP4, resolution, aspect ratio), whether captions or a voice are required, where it will be shown (projector, YouTube, LMS upload, booth TV). Ask for the official brief or rubric text or a screenshot of it.
3. **Deadline.** It decides how ambitious the build can be.
4. **Project stage.** Proposal, mid-way, or finished? What is actually built, simulated or measured? This sets tense and which claims are allowed.
5. **Missing materials.** List the domain-specific items from domains.md that you don't have, each marked *essential* or *nice to have*.
6. **People and branding.** Team names (as they want them shown), supervisor(s), department, university, industry partner, and logos (SVG or PNG with transparent background preferred).
7. **Voice preference** can wait until phase 5, but if they volunteer one, note it.

## Universal materials list

Ask for any of these not already supplied:

| Item | Why it matters |
|---|---|
| Final report / thesis (PDF/DOCX) | Source of truth for facts and story |
| Poster (PDF/PNG/HTML) | Visual identity: colours, fonts, diagram style; often the cleanest diagrams |
| Slides | The team's own narrative order and emphasis |
| Block / architecture / system diagrams | Redrawn as the video's core visuals |
| Results: tables, plots, logs, test outputs | Only measured data can be claimed as achieved |
| Photos / screen recordings / demo clips | Real footage is the strongest proof in a demo video |
| Logos (university, department, partner) | End card and credibility |
| Fonts used in the poster | Visual continuity with the stand |
| Brief / rubric / submission rules | What the video is scored on |

## How to ask

- With the AskUserQuestion tool available: use it for choices (video type, stage, voice path), at most 4 questions per call, recommended option first. Put file requests in plain text alongside it.
- Without it: one message with a numbered list, essential items first. Tell them they can answer in any order and attach files directly.
- Keep it short. If more than 6 items are missing, ask for the essential ones now and the rest later.
- Accept partial answers and proceed. Mark assumptions in `brief.md` so they're easy to revisit.

## brief.md format

```markdown
# Video brief: <project name>
- Video(s): <type, target length, hard cap>
- Shown on: <projector / booth TV / YouTube / LMS>
- Audience: <judges' backgrounds, e.g. mixed faculty + industry>
- Deadline: <date>
- Project stage: <proposal / in progress / finished>; built: <…>; simulated: <…>; measured: <…>
- Rules: <format, captions, voice, branding requirements>
- Materials received: <list with file names>
- Materials missing: <list, essential first>
- Assumptions: <anything decided without the student's confirmation>
```

## Edge cases

- **Group project, one student asking:** still credit every team member; ask how names should appear.
- **Confidential or industry-sponsored work:** ask what may be shown. Blur or abstract the restricted parts rather than dropping the story.
- **Non-English presentation:** script and voice can be in the student's language (Gemini TTS covers 100+ languages). Captions can be in a different language from the narration if the rubric wants it.
- **No diagrams exist:** derive them from the report's text and code, then show them to the student for a correctness check before animating.
- **Vertical or square format required:** plan layouts for it from the start; don't crop a 16:9 design.
