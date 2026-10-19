import { mock } from "node:test";
import { expect, test } from "@playwright/test";
import { observePortfolioVideo } from "../src/lib/portfolio-video-loading";

class LoadingVideo extends EventTarget {
  duration = 5;
  readyState = 0;
  networkState = 0;
  error: MediaError | null = null;
  bufferedEnd = 0;
  get buffered(): TimeRanges {
    return { length: this.bufferedEnd > 0 ? 1 : 0, start: () => 0, end: () => this.bufferedEnd };
  }
}

test.beforeEach(() => mock.timers.enable({ apis: ["setTimeout"] }));
test.afterEach(() => mock.timers.reset());

test("a decoded frame releases the portfolio without downloading the entire video", () => {
  const video = new LoadingVideo();
  let opened = false;
  observePortfolioVideo(video, { onProgress: () => {}, onReady: () => { opened = true; } });
  video.readyState = 2;
  video.bufferedEnd = 0.5;
  video.dispatchEvent(new Event("loadeddata"));
  expect(opened).toBe(true);
});

test("slow but continuing downloads cannot keep the screen blocked beyond four seconds", () => {
  const video = new LoadingVideo();
  let opened = false;
  observePortfolioVideo(video, { onProgress: () => {}, onReady: () => { opened = true; } });
  for (let second = 0; second < 4; second++) {
    mock.timers.tick(1000);
    video.bufferedEnd += 0.1;
    video.dispatchEvent(new Event("progress"));
  }
  expect(opened).toBe(true);
});

test("metadata alone does not mark an undecoded video as ready", () => {
  const video = new LoadingVideo();
  let opened = false;
  observePortfolioVideo(video, { onProgress: () => {}, onReady: () => { opened = true; } });
  video.readyState = 1;
  video.dispatchEvent(new Event("loadedmetadata"));
  mock.timers.tick(3999);
  expect(opened).toBe(false);
  mock.timers.tick(1);
  expect(opened).toBe(true);
});

test("video errors release the site and completion is only reported once", () => {
  const video = new LoadingVideo();
  let opened = 0;
  observePortfolioVideo(video, { onProgress: () => {}, onReady: () => { opened++; } });
  video.dispatchEvent(new Event("error"));
  video.dispatchEvent(new Event("error"));
  mock.timers.tick(20000);
  expect(opened).toBe(1);
});

test("unmounting stops timers and video listeners", () => {
  const video = new LoadingVideo();
  let opened = false;
  const cleanup = observePortfolioVideo(video, { onProgress: () => {}, onReady: () => { opened = true; } });
  cleanup();
  video.dispatchEvent(new Event("error"));
  mock.timers.tick(20000);
  expect(opened).toBe(false);
});

test("sources that failed before hydration release the site immediately", () => {
  const video = new LoadingVideo();
  video.networkState = 3;
  let opened = false;
  observePortfolioVideo(video, { onProgress: () => {}, onReady: () => { opened = true; } });
  expect(opened).toBe(true);
});
