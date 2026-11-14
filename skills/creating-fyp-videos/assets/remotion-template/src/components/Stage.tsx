/**
 * Stage: assembles one video from its timeline.
 *  - scenes cross-fade (0.5 s) at their start times
 *  - sentence captions in the lower fifth (no karaoke)
 *  - voice clips, music bed with automatic ducking under speech, sound effects
 * Every scene component draws SVG in a 1920x1080 viewBox and reads time via useT().
 */
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F} from '../lib/theme';
import {Cues, EO, TimeCtx, clamp, useT} from '../lib/anim';

export type Caption = {s: number; e: number; text: string};
export type SceneDef = {id: string; start: number; end: number};
export type Timeline = {
  fps: number;
  duration: number;
  clips: {src: string; at: number}[];
  scenes: SceneDef[];
  captions: Caption[];
  cues: Cues;
  music?: string | null;
};
export type Sfx = {at: number; name: string; vol?: number};
export type SceneComp = React.FC<{s: SceneDef}>;

export const Captions: React.FC<{caps: Caption[]}> = ({caps}) => {
  const {t} = useT();
  const c = caps.find((k) => t >= k.s - 0.05 && t < k.e + 0.15);
  if (!c) return null;
  const o = Math.min(clamp((t - c.s + 0.05) / 0.15), clamp((c.e + 0.15 - t) / 0.15));
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 54, pointerEvents: 'none'}}>
      <div
        style={{
          maxWidth: 1480,
          padding: '12px 30px 14px',
          borderRadius: 12,
          background: 'rgba(7, 28, 47, 0.84)',
          color: '#F4F8FB',
          fontFamily: F.body,
          fontWeight: 600,
          fontSize: 38,
          lineHeight: 1.28,
          textAlign: 'center',
          textWrap: 'balance' as React.CSSProperties['textWrap'],
          opacity: o,
          transform: `translateY(${(1 - o) * 6}px)`,
        }}
      >
        {c.text}
      </div>
    </AbsoluteFill>
  );
};

/** Default music level: louder in gaps, ducked under speech. Override per video if needed. */
export const defaultMusicLevel = (lastWord: number) => (t: number, speaking: boolean) => {
  if (t > lastWord) return 0.45;
  return speaking ? 0.13 : 0.26;
};

export const Stage: React.FC<{
  tl: Timeline;
  scenes: Record<string, SceneComp>;
  captions: boolean;
  sfx?: Sfx[];
  musicLevel?: (t: number, speaking: boolean) => number;
  /** scene ids that appear instantly (e.g. they do their own wipe) */
  noFade?: string[];
}> = ({tl, scenes, captions, sfx = [], musicLevel, noFade = []}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const XF = 0.5;
  const lastWord = tl.captions.length ? tl.captions[tl.captions.length - 1].e : tl.duration;
  const level = musicLevel ?? defaultMusicLevel(lastWord);
  const speakingAt = (tt: number) => tl.captions.some((c) => tt >= c.s - 0.15 && tt <= c.e);
  return (
    <TimeCtx.Provider value={{t, cues: tl.cues, frame}}>
      <AbsoluteFill style={{background: C.night}}>
        {tl.scenes.map((s) => {
          if (t < s.start || t > s.end + XF) return null;
          const Comp = scenes[s.id];
          if (!Comp) return null;
          const o = s.start === 0 || noFade.includes(s.id) ? 1 : EO(clamp((t - s.start) / XF));
          return (
            <AbsoluteFill key={s.id} style={{opacity: o}}>
              <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
                <Comp s={s} />
              </svg>
            </AbsoluteFill>
          );
        })}
        {captions && <Captions caps={tl.captions} />}
      </AbsoluteFill>
      {tl.clips.map((c) => (
        <Sequence key={c.src} from={Math.round(c.at * fps)} layout="none">
          <Audio src={staticFile(c.src)} />
        </Sequence>
      ))}
      {tl.music && (
        <Audio
          src={staticFile(tl.music)}
          volume={(f) => {
            // smooth ducking: average the speaking state over ±0.25 s
            const tt = f / fps;
            let sp = 0;
            for (let k = -3; k <= 3; k++) sp += speakingAt(tt + k * 0.08) ? 1 : 0;
            sp /= 7;
            return level(tt, false) * (1 - sp) + level(tt, true) * sp;
          }}
        />
      )}
      {sfx.map((x, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(x.at * fps))} layout="none">
          <Audio src={staticFile(`audio/sfx/${x.name}.wav`)} volume={x.vol ?? 0.3} />
        </Sequence>
      ))}
    </TimeCtx.Provider>
  );
};
