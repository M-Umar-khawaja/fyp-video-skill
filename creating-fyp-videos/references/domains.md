# Domain playbooks

Find the project's domain (or the two closest, for mixed projects) and use that section for: what to ask for, what judges in that field look for, the signature visuals, and the traps. The general rules in visual-design.md still apply.

## Contents
- VLSI / digital hardware / FPGA
- Embedded systems / IoT
- Software / web / mobile apps
- AI / machine learning / data science
- Networking / cybersecurity / cryptography
- Robotics / mechatronics / control
- Power / electrical / renewable energy
- Communications / signal processing / RF
- Mechanical / civil / structural
- Biomedical / healthcare
- Business-tech / social impact

---

## VLSI / digital hardware / FPGA

**Ask for:** RTL spec or interface doc, block diagram, pipeline/timing diagrams, synthesis reports (area, timing, power), simulation waveforms or coverage, FPGA utilisation, target technology node and clock, testbench results.
**Judges look for:** a clear dataflow, why the architecture beats the obvious alternative (area/latency/throughput trade-off), verification rigour, honest targets vs measured numbers.
**Signature visuals:** the block diagram drawn as one canvas with a camera flying through it; a command or packet travelling the real datapath (solid = data, dashed = control); pipeline stages filling; bit-level lane splits; memory word packing; clock waveform with period; resource or latency heatmaps; roadmap from RTL to FPGA to ASIC.
**Traps:** presenting estimates as silicon results; inventing bus names; diagrams that don't match the RTL; too many blocks at once (reveal progressively).

## Embedded systems / IoT

**Ask for:** system architecture, schematic/PCB images, sensor list and specs, firmware state machine, communication protocol (MQTT, BLE, LoRa…), power budget, photos of the prototype, dashboard screenshots, field test data.
**Judges look for:** a working prototype, real-world deployment conditions, power and cost, reliability.
**Signature visuals:** sensor → MCU → gateway → cloud → dashboard flow with real packets; the physical device photo with labelled callouts; battery-life or power bar; state machine lighting up; a live data chart drawing in; before/after field scenario.
**Traps:** a dashboard mock that doesn't exist; ignoring power or cost; no photo of the actual hardware.

## Software / web / mobile apps

**Ask for:** screen recordings (1080p+, clean test data, no personal info), architecture diagram, user flows, tech stack, user testing results, performance metrics, repository link.
**Judges look for:** the user's problem, a smooth demo of the core flow, technical depth beneath the UI, evaluation with real users.
**Signature visuals:** screen recordings framed in a device mockup with zoom-ins on the key interaction; the request travelling through the architecture (client → API → services → DB); before/after task time; usability scores.
**Traps:** demo footage with real personal data; showing every feature instead of the one core flow; tiny unreadable UI (zoom in).

## AI / machine learning / data science

**Ask for:** dataset description and size, model architecture, training setup, evaluation metrics with baselines, confusion matrices or curves, example inputs and outputs (including failures), deployment details.
**Judges look for:** the problem framing, data quality, comparison against baselines, honest limitations, real examples.
**Signature visuals:** a real input flowing through the pipeline to an output; architecture drawn layer by layer; metric bars against baselines; side-by-side predictions vs ground truth; an attention or saliency overlay if available; a confusion matrix that builds cell by cell.
**Traps:** accuracy without a baseline or test-set definition; cherry-picked examples only; "AI brain" stock imagery.

## Networking / cybersecurity / cryptography

**Ask for:** threat model, protocol or message-sequence diagrams, algorithm specs/standards (RFC, FIPS, NIST), attack or test scenarios, performance numbers, testbed topology.
**Judges look for:** a clearly stated threat, why the defence works, correctness against standards, overhead cost.
**Signature visuals:** two endpoints with messages travelling (what is public vs secret, labelled with real sizes); an eavesdropper/recorder that gets only public data; a tamper attempt (one changed byte) that fails verification; key lifecycle; topology diagram with traffic.
**Traps:** wrong message direction or key ownership (check against the standard); hooded-hacker clip art; claiming "unbreakable".

## Robotics / mechatronics / control

**Ask for:** robot photos and video, CAD renders, kinematic/control block diagrams, sensor suite, controller design (PID, MPC…), step responses or tracking plots, test runs.
**Judges look for:** the robot doing the task, the control loop explained, robustness tests.
**Signature visuals:** real footage with overlays (trajectories, sensor rays, detected objects); the control loop as a block diagram with the signal travelling; step response drawing in against the setpoint; CAD exploded view.
**Traps:** sped-up footage without saying so; simulation shown as hardware.

## Power / electrical / renewable energy

**Ask for:** single-line diagrams, circuit schematics, converter topology, simulation (MATLAB/Simulink, PSCAD) plots, efficiency and THD numbers, hardware photos, load profiles.
**Judges look for:** efficiency, stability, safety, cost, grid or sustainability impact.
**Signature visuals:** current/power flow animated along the single-line diagram; switching waveforms; efficiency curve across load; energy flow (Sankey-like) for a day.
**Traps:** simulated efficiency presented as measured; unreadable schematics (simplify to blocks first).

## Communications / signal processing / RF

**Ask for:** system block diagram (Tx/channel/Rx), constellation or spectrum plots, BER/SNR curves, antenna patterns, measurement setup photos.
**Signature visuals:** a signal transforming through each block (time → frequency); constellation points tightening as the algorithm works; BER curves against theory/baseline; antenna radiation pattern sweep.
**Traps:** curves without axes or units; theory curves shown as measurement.

## Mechanical / civil / structural

**Ask for:** CAD models or renders, FEA/CFD results, drawings, material choices, prototype photos, test results, cost analysis, sustainability data.
**Signature visuals:** exploded assemblies; stress/flow colour maps revealed progressively; load path animated; before/after comparisons; build timelapse photos.
**Traps:** colour maps without scales; renders implied to be built prototypes.

## Biomedical / healthcare

**Ask for:** clinical problem statement and statistics with sources, device/system diagram, signal recordings (ECG, EEG…), validation results, ethics approval status, user (clinician/patient) feedback.
**Judges look for:** the clinical need, safety, validation, ethics, real users.
**Signature visuals:** physiological signal traces with the algorithm marking events; patient journey before/after; device photo with callouts; accuracy against clinical reference.
**Traps:** identifiable patient data; diagnostic claims beyond the validation; gore or alarming imagery.

## Business-tech / social impact

**Ask for:** problem statistics with sources, user research, business model, prototype screens, pilot results, partners.
**Signature visuals:** a persona's day before/after; market or impact numbers counting up with sources; the product flow; the pilot map.
**Traps:** unsourced market sizes; too much text on screen.
