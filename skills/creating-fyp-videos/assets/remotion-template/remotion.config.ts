import {Config} from '@remotion/cli/config';

// Optional: reuse an installed Chrome instead of downloading a headless browser.
// Set REMOTION_BROWSER_EXECUTABLE (scripts/check_env.mjs prints the path it finds).
const browser = process.env.REMOTION_BROWSER_EXECUTABLE;
if (browser) {
  Config.setBrowserExecutable(browser);
  Config.setChromeMode('chrome-for-testing');
}
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');
Config.setConcurrency(3);
