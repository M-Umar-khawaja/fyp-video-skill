# Understanding the project

The video can only be as clear as your understanding. Judges ask hard questions after watching, so every frame must survive scrutiny.

## Contents
- Reading the material
- Researching the domain
- fact-sheet.md
- claims-ledger.md
- glossary.md
- Resolving conflicts

## Reading the material

- Read every supplied file completely. For PDFs, read the figures as images, not just the text: the diagram captions and axes often contain the real module names and units.
- Note the **source of truth** when documents disagree. Usually the newest artifact (poster or latest spec) wins over the original proposal. Ask if unsure.
- For code repositories, read the entry points, top-level modules and README to confirm the architecture matches the report.
- Collect the visual identity while reading: colour hex values, font names, logo files, line style, the iconography already used.

## Researching the domain

Use web search (or your own knowledge when offline) to fill gaps the student's documents assume:
- The standards, algorithms or physical principles involved, from primary sources (standards bodies, datasheets, papers, official docs).
- How experts conventionally draw the concepts (message sequence charts for protocols, single-line diagrams for power, and so on). Matching conventions makes the video read as competent to specialist judges.
- One or two strong framing facts for the hook, such as a deadline, a statistic or a real incident, each with a citable source.

Keep a source list. Background facts from research go in the ledger tagged **background (cited)**.

## fact-sheet.md

One page, in plain language, as if explaining to a smart first-year student:

```markdown
# <Project> fact sheet
**Problem:** <who suffers, why it matters now, one framing fact with source>
**Idea:** <the core insight in one sentence>
**How it works:** <3–6 bullets following the real dataflow, using real module names>
**What is done / measured:** <…>
**What is planned / targeted:** <…>
**Why it's better:** <the comparison: against what baseline, by how much, measured or estimated>
**Impact / applications:** <…>
**People:** <team, supervisors, department, university, partners, exact spellings>
```

## claims-ledger.md

Every number or factual claim that might appear on screen or in narration:

| # | Claim | Value | Status | Source | Wording rule |
|---|---|---|---|---|---|
| 1 | Clock target | 500 MHz | target | poster §4 | "targets", "at the 500 MHz target" |
| 2 | NTT fill latency | 111 cycles | design budget | spec Table 3 | "budgeted for", "is due in" |
| 3 | Classification accuracy | 94.2 % | measured | report Table 5.1 | "achieves", "measured" |
| 4 | NIST retirement date | 2035 | background (cited) | NIST IR 8547 | plain statement |

Status values: **measured**, **simulated**, **target/estimate**, **design budget**, **planned**, **background (cited)**.

Rules:
- If it isn't in the ledger, it doesn't go in the video.
- Status decides wording and on-screen labelling (e.g. a small "Target" or "Simulated" tag). A consistent colour for targets/estimates teaches viewers the convention.
- Round only as the source rounds. Keep units.

## glossary.md

Each acronym, product name and person or place name the narrator says:

| Written | Spoken (for TTS script) | Notes |
|---|---|---|
| RISC-V | risk five | |
| ML-KEM | M-L kem | |
| FPGA | F-P-G-A | letters |
| ASIC | ay-sick | |
| NUST | nust | confirm with the student how the team says it |

Captions use the written form; the voice script uses the spoken form. Ask the student about anything whose pronunciation is local (university names, partner companies, people).

## Resolving conflicts

When sources disagree on a fact that will appear on screen, list the conflict in one line each and ask the student which is current. Record the answer in the ledger's source column.
