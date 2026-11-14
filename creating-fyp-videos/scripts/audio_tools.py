"""Audio for FYP videos, all generated locally (no samples, nothing to license).

Run from the project root (needs Python 3.9+ and numpy):
  python scripts/audio_tools.py voice          # clean + level every take in public/audio/voice/takes
  python scripts/audio_tools.py sfx            # synthesize the sound-effect palette into public/audio/sfx
  python scripts/audio_tools.py music          # one music bed per video in src/data/timeline.json
  python scripts/audio_tools.py all            # voice, sfx, music

Music options per video in video.spec.json:
  "music": {"mood": "calm" | "bright" | "tense", "fullAt": "<cue name>", "endAt": "<cue name>"}
  "music": false   -> no bed for that video
After `music`, src/data/timeline.json is updated to point at the new beds.
"""
import json
import os
import sys
import wave

try:
    import numpy as np
except ImportError:
    sys.exit("numpy is required: python -m pip install numpy")

ROOT = os.getcwd()
PUB = os.path.join(ROOT, "public", "audio")
SR = 48000  # output rate for music and effects; voice keeps its own rate
rng = np.random.default_rng(7)


# ------------------------------------------------------------------ io
def read_wav(p):
    with wave.open(p) as w:
        ch, sw, sr, n = w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes()
        data = w.readframes(n)
    if sw == 2:
        x = np.frombuffer(data, dtype=np.int16).astype(np.float64) / 32768
    elif sw == 3:
        b = np.frombuffer(data, dtype=np.uint8).reshape(-1, 3)
        x = (b[:, 0].astype(np.int32) | (b[:, 1].astype(np.int32) << 8) | (b[:, 2].astype(np.int32) << 16))
        x = np.where(x >= 1 << 23, x - (1 << 24), x).astype(np.float64) / (1 << 23)
    elif sw == 4:
        x = np.frombuffer(data, dtype=np.int32).astype(np.float64) / 2**31
    else:
        raise ValueError(f"{p}: unsupported sample width {sw}")
    if ch > 1:
        x = x.reshape(-1, ch).mean(axis=1)  # narration: mono is what we want
    return x, sr


def write_wav(p, x, sr=SR):
    x = np.asarray(x)
    if x.ndim == 1:
        x = x[:, None]
    y = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with wave.open(p, "wb") as w:
        w.setnchannels(y.shape[1])
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(y.tobytes())


def fft_filter(x, sr, lo=None, hi=None):
    """Gentle 2nd-order-like high/low-pass in the frequency domain."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / sr)
    g = np.ones_like(f)
    if lo:
        g *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** 4)
    if hi:
        g *= 1 / np.sqrt(1 + (f / hi) ** 4)
    return np.fft.irfft(X * g, len(x))


# ------------------------------------------------------------------ voice
def voice():
    src_dir = os.path.join(PUB, "voice", "takes")
    names = sorted(f for f in os.listdir(src_dir) if f.lower().endswith(".wav"))
    if not names:
        sys.exit(f"No .wav takes in {src_dir}")
    print(f"{'take':28} {'dur':>6} {'gain':>6} {'peak':>6}")
    for f in names:
        x, sr = read_wav(os.path.join(src_dir, f))
        x = fft_filter(x - x.mean(), sr, lo=70)  # remove rumble and DC
        hop = sr // 100
        m = len(x) // hop
        r = np.sqrt(np.mean(x[: m * hop].reshape(m, hop) ** 2, axis=1) + 1e-12)
        speech = r[20 * np.log10(r) > -40]  # ignore silences when measuring level
        rms = np.sqrt(np.mean(speech**2)) if len(speech) else 0.05
        gain = 10 ** (-20 / 20) / rms  # speech RMS at -20 dBFS: same level for every take
        x = x * gain
        t = 10 ** (-3 / 20)  # soft limiter above -3 dBFS
        over = np.abs(x) > t
        x[over] = np.sign(x[over]) * (t + (1 - t) * np.tanh((np.abs(x[over]) - t) / (1 - t)) * 0.9)
        fade = int(0.01 * sr)
        x[:fade] *= np.linspace(0, 1, fade)
        x[-fade:] *= np.linspace(1, 0, fade)
        write_wav(os.path.join(PUB, "voice", f), x, sr)
        print(f"{f[:28]:28} {len(x) / sr:6.1f} {20 * np.log10(gain):+6.1f} {20 * np.log10(np.max(np.abs(x)) + 1e-9):6.1f}")
    print("cleaned takes written to public/audio/voice/ (rerun build_timeline.mjs so clips point at them)")


# ------------------------------------------------------------------ sfx
def env_exp(n, tau, att=0.002):
    t = np.arange(n) / SR
    return np.exp(-t / tau) * (1 - np.exp(-t / att))


def bell(freq, dur=2.2, amp=0.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    partials = [(1, 1), (2.0, 0.35), (2.76, 0.2), (5.4, 0.08)]
    y = sum(a * np.sin(2 * np.pi * freq * r * t) * np.exp(-t / (dur / (1 + 2 * k))) for k, (r, a) in enumerate(partials))
    return y * (1 - np.exp(-t / 0.003)) * amp


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def two_notes(a, b, dur, gap, l1=2.2, l2=2.2, amp=0.5):
    out = np.zeros(int(dur * SR))
    x, y = bell(midi(a), l1, amp), bell(midi(b), l2, amp)
    out[: len(x)] += x[: len(out)]
    s = int(gap * SR)
    out[s : s + len(y)] += y[: len(out) - s]
    return out


def sfx():
    out = {}
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    out["tick"] = (np.sin(2 * np.pi * 2600 * t) * 0.6 + fft_filter(rng.standard_normal(n), SR, lo=3000) * 0.4) * env_exp(n, 0.012)
    out["tick_soft"] = np.sin(2 * np.pi * 1500 * t) * env_exp(n, 0.02) * 0.7
    n = int(0.7 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    fc = 300 + 2600 * np.sin(np.pi * np.arange(n) / n) ** 2  # sweeping one-pole low-pass
    al = 1 - np.exp(-2 * np.pi * fc / SR)
    lp = np.zeros(n)
    y = 0.0
    for i in range(n):
        y += al[i] * (noise[i] - y)
        lp[i] = y
    out["whoosh"] = fft_filter(lp, SR, lo=200) * np.sin(np.pi * t / t[-1]) ** 2 * 1.4
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    c1 = fft_filter(rng.standard_normal(n), SR, lo=2500, hi=7000) * env_exp(n, 0.006)
    c = np.zeros(int(0.16 * SR))
    c[:n] += c1
    c[int(0.035 * SR) : int(0.035 * SR) + n] += c1 * 0.7
    c[:n] += np.sin(2 * np.pi * 900 * t) * env_exp(n, 0.015) * 0.3
    out["click"] = c
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    out["crack"] = fft_filter(rng.standard_normal(n), SR, lo=1200, hi=9000) * env_exp(n, 0.02) * 0.9 + np.sin(2 * np.pi * 1250 * t) * env_exp(n, 0.05) * 0.25
    n = int(0.18 * SR)
    t = np.arange(n) / SR
    out["pop"] = np.sin(2 * np.pi * np.cumsum(520 + 380 * (1 - np.exp(-t / 0.03))) / SR) * env_exp(n, 0.05) * 0.8
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    out["thunk"] = np.sin(2 * np.pi * np.cumsum(95 + 60 * np.exp(-t / 0.04)) / SR) * env_exp(n, 0.09) * 0.9 + fft_filter(rng.standard_normal(n), SR, hi=900) * env_exp(n, 0.03) * 0.5
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    out["stamp"] = np.sin(2 * np.pi * np.cumsum(80 + 50 * np.exp(-t / 0.02)) / SR) * env_exp(n, 0.06) * 0.8 + fft_filter(rng.standard_normal(n), SR, lo=800, hi=5000) * env_exp(n, 0.025) * 0.4
    n = int(1.4 * SR)
    t = np.arange(n) / SR
    out["riser"] = fft_filter(rng.standard_normal(n), SR, lo=500, hi=5000) * (t / t[-1]) ** 2.5 * 0.35
    out["motif"] = two_notes(81, 86, 2.8, 0.32) * 0.8  # brand motif: name reveal and end card
    out["ok"] = two_notes(84, 91, 1.6, 0.12, 1.2, 1.3, 0.4) * 0.7  # success
    out["notify"] = two_notes(88, 95, 0.9, 0.09, 0.5, 0.6, 0.35)
    for k, v in out.items():
        v = v / (np.max(np.abs(v)) + 1e-9) * 0.9
        f = int(0.003 * SR)
        v[-f:] *= np.linspace(1, 0, f)
        write_wav(os.path.join(PUB, "sfx", k + ".wav"), v)
    print("sfx:", ", ".join(out))


# ------------------------------------------------------------------ music
MOODS = {
    # chord voicings (MIDI), arpeggio patterns, tempo
    "calm": {"bpm": 90, "prog": [[50, 57, 62, 64, 65], [46, 53, 58, 62, 69], [41, 53, 57, 60, 67], [48, 55, 60, 62, 67]],
             "arp": [[62, 69, 64, 65, 69, 74, 65, 69], [58, 65, 62, 69, 65, 70, 62, 65], [57, 60, 64, 67, 60, 65, 67, 72], [60, 67, 62, 64, 67, 72, 62, 67]],
             "final": [41, 48, 53, 57, 60, 67, 72], "ring": [65, 72, 77]},
    "bright": {"bpm": 100, "prog": [[48, 55, 60, 64, 67], [45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [43, 50, 55, 59, 62]],
               "arp": [[64, 67, 72, 67, 76, 72, 67, 72], [60, 64, 69, 64, 72, 69, 64, 69], [57, 60, 65, 60, 69, 65, 60, 65], [59, 62, 67, 62, 71, 67, 62, 67]],
               "final": [48, 55, 60, 64, 67, 72, 76], "ring": [72, 76, 79]},
    "tense": {"bpm": 84, "prog": [[45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [43, 50, 55, 59, 62], [40, 47, 52, 56, 59]],
              "arp": [[57, 64, 60, 64, 69, 64, 60, 64], [53, 60, 57, 60, 65, 60, 57, 60], [55, 62, 59, 62, 67, 62, 59, 62], [52, 59, 56, 59, 64, 59, 56, 59]],
              "final": [45, 52, 57, 60, 64, 69], "ring": [69, 72, 76]},
}


def pad_voice(freq, dur, amp, harm=7):
    t = np.arange(int(dur * SR)) / SR
    y = np.zeros_like(t)
    for d in (-0.07, 0.0, 0.07):  # three slightly detuned voices: soft chorus
        f = freq * 2 ** (d / 12)
        ph = rng.uniform(0, 2 * np.pi)
        for h in range(1, harm + 1):
            y += np.sin(2 * np.pi * f * h * t + ph * h) / (h**1.6)
    return y * amp / 3


def env_ad(n, a, r):
    e = np.ones(n)
    na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    e[:na] = np.linspace(0, 1, na) ** 2
    e[n - nr :] *= np.linspace(1, 0, nr) ** 1.5
    return e


def pluck(freq, dur=0.9, amp=0.2):
    t = np.arange(int(dur * SR)) / SR
    y = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(4 * np.pi * freq * t) + 0.1 * np.sin(6 * np.pi * freq * t)
    return y * np.exp(-t / 0.28) * (1 - np.exp(-t / 0.004)) * amp


def kick(amp=0.26):
    t = np.arange(int(0.45 * SR)) / SR
    return np.sin(2 * np.pi * np.cumsum(52 + 70 * np.exp(-t / 0.035)) / SR) * np.exp(-t / 0.16) * amp


def add(buf, sig, at, pan=0.0):
    i = int(at * SR)
    if i >= len(buf) or i < 0:
        return
    s = sig[: len(buf) - i]
    buf[i : i + len(s), 0] += s * np.cos((pan + 1) * np.pi / 4) * 1.41
    buf[i : i + len(s), 1] += s * np.sin((pan + 1) * np.pi / 4) * 1.41


def reverb(buf, secs=2.2, wet=0.28):
    n = int(secs * SR)
    t = np.arange(n) / SR
    out = np.zeros_like(buf)
    for ch in range(2):
        ir = fft_filter(rng.standard_normal(n) * np.exp(-t / (secs / 6.5)), SR, lo=200, hi=6000)
        ir /= np.sqrt(np.sum(ir**2))
        N = 1 << int(np.ceil(np.log2(len(buf) + n)))
        y = np.fft.irfft(np.fft.rfft(buf[:, ch].astype(np.float32), N) * np.fft.rfft(ir.astype(np.float32), N), N)[: len(buf)]
        out[:, ch] = buf[:, ch] * (1 - wet) + y * wet
    return out


def music_bed(duration, full_at, end_at, mood="calm"):
    M = MOODS[mood]
    beat = 60 / M["bpm"]
    chord_len = beat * 8
    buf = np.zeros((int(duration * SR), 2))
    if full_at > 0.5:  # quiet drone intro until the bed comes in
        n = int((full_at + 0.4) * SR)
        t = np.arange(n) / SR
        root = M["prog"][0][0]
        dr = np.sin(2 * np.pi * midi(root - 12) * t) * 0.5 + np.sin(2 * np.pi * midi(root - 5) * t) * 0.3 + pad_voice(midi(root), n / SR, 0.15, harm=4)
        add(buf, dr * np.minimum(1, t / 3.0) * np.clip((full_at - t) / 0.6, 0, 1) ** 0.7 * 0.22, 0)
    t0, k = full_at, 0
    while t0 < end_at:
        d = min(chord_len + 1.2, duration - t0)
        if d <= 0.2:
            break
        for j, note in enumerate(M["prog"][k % 4]):
            v = pad_voice(midi(note), d, 0.16 if j else 0.2)
            add(buf, v * env_ad(len(v), 1.0, 1.4), t0, pan=-0.5 + j * 0.25)
        if k >= 1:  # arpeggio enters on the second chord
            for b8 in range(16):
                at = t0 + b8 * beat / 2
                if at < end_at:
                    add(buf, pluck(midi(M["arp"][k % 4][b8 % 8]), amp=0.09), at, pan=-0.35 if b8 % 2 else 0.35)
        if k >= 2:  # soft pulse from the third chord
            for bb in range(2):
                if t0 + bb * beat * 4 < end_at:
                    add(buf, kick(), t0 + bb * beat * 4)
        t0 += chord_len
        k += 1
    d = max(1.0, duration - end_at)
    for j, note in enumerate(M["final"]):  # resolve on the end card
        v = pad_voice(midi(note), d, 0.15)
        add(buf, v * env_ad(len(v), 0.6, d * 0.75), end_at, pan=-0.6 + j * 0.2)
    for j, note in enumerate(M["ring"]):
        add(buf, pluck(midi(note), 2.5, 0.09), end_at + j * beat / 2, pan=-0.3 + j * 0.3)
    buf = reverb(buf)
    f = int(min(3.0, d * 0.9) * SR)
    buf[-f:] *= np.linspace(1, 0, f)[:, None] ** 1.5
    return buf / (np.max(np.abs(buf)) + 1e-9) * 0.5


def music():
    tl_path = os.path.join(ROOT, "src", "data", "timeline.json")
    tl = json.load(open(tl_path, encoding="utf-8"))
    spec_path = os.path.join(ROOT, "video.spec.json")
    spec = json.load(open(spec_path, encoding="utf-8")).get("videos", {}) if os.path.exists(spec_path) else {}
    for vid, v in tl.items():
        opt = spec.get(vid, {}).get("music", True)
        if opt is False:
            print(f"{vid}: music disabled")
            continue
        opt = opt if isinstance(opt, dict) else {}
        cues = v.get("cues", {})
        last = v["captions"][-1]["e"] if v.get("captions") else v["duration"] - 3
        full_at = cues.get(opt.get("fullAt"), 0.0) if opt.get("fullAt") else 0.0
        end_at = cues.get(opt.get("endAt"), last) if opt.get("endAt") else max(0.0, last - 2.0)
        mood = opt.get("mood", "calm")
        bed = music_bed(v["duration"], full_at, end_at, mood)
        write_wav(os.path.join(PUB, "music", f"{vid}_bed.wav"), bed)
        v["music"] = f"audio/music/{vid}_bed.wav"
        print(f"{vid}: {mood} bed, {v['duration']:.1f} s, full at {full_at:.1f} s, resolves at {end_at:.1f} s")
    json.dump(tl, open(tl_path, "w", encoding="utf-8"), indent=1)


if __name__ == "__main__":
    cmds = sys.argv[1:] or ["all"]
    if "all" in cmds:
        cmds = ["voice", "sfx", "music"]
    for c in cmds:
        {"voice": voice, "sfx": sfx, "music": music}[c]()
