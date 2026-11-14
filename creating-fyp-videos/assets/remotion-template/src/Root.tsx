import React from 'react';
import {Composition, getStaticFiles} from 'remotion';
import {Stage} from './components/Stage';
import {TIMELINES, VIDEOS, VideoDef} from './videos';

// Sound effects are skipped (not crashed on) until scripts/audio_tools.py has generated them.
const haveFile = (p: string) => {
  try {
    return getStaticFiles().some((f) => f.name === p);
  } catch {
    return true;
  }
};

const make = (v: VideoDef): React.FC<{captions: boolean}> => {
  const Comp: React.FC<{captions: boolean}> = ({captions}) => {
    const tl = TIMELINES[v.id];
    const sfx = (v.sfx ? v.sfx(tl.cues) : []).filter((x) => haveFile(`audio/sfx/${x.name}.wav`));
    return <Stage tl={tl} scenes={v.scenes} captions={captions} sfx={sfx} noFade={v.noFade} musicLevel={v.musicLevel} />;
  };
  return Comp;
};

export const Root: React.FC = () => (
  <>
    {VIDEOS.map((v) => {
      const tl = TIMELINES[v.id];
      if (!tl) throw new Error(`No timeline for video "${v.id}" in src/data/timeline.json. Run: node scripts/build_timeline.mjs`);
      const Comp = make(v);
      const frames = Math.round(tl.duration * tl.fps);
      return (
        <React.Fragment key={v.id}>
          <Composition id={v.name} component={Comp} durationInFrames={frames} fps={tl.fps} width={1920} height={1080} defaultProps={{captions: true}} />
          <Composition id={`${v.name}Clean`} component={Comp} durationInFrames={frames} fps={tl.fps} width={1920} height={1080} defaultProps={{captions: false}} />
        </React.Fragment>
      );
    })}
  </>
);
