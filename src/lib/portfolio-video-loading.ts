type PortfolioVideo = Pick<HTMLMediaElement, "duration" | "readyState" | "networkState" | "buffered" | "error"> & EventTarget;

type LoadingCallbacks = {
  onProgress: (progress: number) => void;
  onReady: () => void;
};

export function observePortfolioVideo(video: PortfolioVideo, { onProgress, onReady }: LoadingCallbacks) {
  let active = true;
  const events = ["loadedmetadata", "loadeddata", "canplay", "progress", "suspend"];
  // A slow download must never indefinitely block projects and contacts.
  const deadline = setTimeout(finishLoading, 4000);

  function cleanup() {
    active = false;
    clearTimeout(deadline);
    events.forEach((event) => video.removeEventListener(event, update));
    video.removeEventListener("error", finishLoading);
  }

  function finishLoading() {
    if (!active) return;
    cleanup();
    onReady();
  }

  function update() {
    if (!active) return;
    if (video.error || video.networkState === 3 || video.readyState >= 2) {
      finishLoading();
      return;
    }
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    const startBuffered = video.buffered.length > 0 && video.buffered.start(0) < 0.1
      ? video.buffered.end(0) : 0;
    onProgress(Math.min(99, Math.floor(startBuffered / Math.min(1, video.duration) * 100)));
  }

  events.forEach((event) => video.addEventListener(event, update));
  video.addEventListener("error", finishLoading);
  update();
  return cleanup;
}
