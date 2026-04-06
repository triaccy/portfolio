/**
 * Video Controls Module
 * Unified bottom-bar controls for all YouTube/Vimeo embeds.
 */

// ─── URL helpers ─────────────────────────────────────────────────────────────

function ensureVideoNoInterface(url) {
  if (!url) return url;
  if (url.includes('youtube.com/embed') || url.includes('youtu.be')) {
    const u = new URL(url);
    u.searchParams.set('controls', '0');
    u.searchParams.set('modestbranding', '1');
    u.searchParams.set('rel', '0');
    u.searchParams.set('showinfo', '0');
    u.searchParams.set('iv_load_policy', '3');
    u.searchParams.set('fs', '0');
    u.searchParams.set('disablekb', '1');
    u.searchParams.set('playsinline', '1');
    u.searchParams.set('enablejsapi', '1');
    return u.toString();
  }
  if (url.includes('vimeo.com')) {
    let urlStr = url;
    if (url.includes('vimeo.com/video/') && !url.includes('player.vimeo.com')) {
      const m = url.match(/vimeo\.com\/video\/(\d+)/);
      if (m) urlStr = `https://player.vimeo.com/video/${m[1]}`;
    }
    const u = new URL(urlStr);
    u.searchParams.set('controls', '0');
    u.searchParams.set('title', '0');
    u.searchParams.set('byline', '0');
    u.searchParams.set('portrait', '0');
    u.searchParams.set('badge', '0');
    u.searchParams.set('autopause', '0');
    return u.toString();
  }
  return url;
}

function getVideoId(url, type) {
  if (!url) return null;
  if (type === 'youtube') {
    const m = url.match(/(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([^&\s]+)/);
    return m ? m[1] : null;
  }
  if (type === 'vimeo') {
    const m = url.match(/(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/);
    return m ? m[1] : null;
  }
  return null;
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}

// ─── CSS injection ────────────────────────────────────────────────────────────

function applyVideoImageStyle() {
  const style = document.createElement('style');
  style.textContent = `
    .video-container iframe,
    .display-video {
      object-fit: contain;
    }

    /* Controls overlay — hidden, shown on hover */
    .video-controls-overlay {
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: none;
      z-index: 10;
    }
    .video-container:hover .video-controls-overlay {
      opacity: 1;
      pointer-events: auto;
    }
    .image-display.gallery .display-container:has(.display-video.active):hover .video-controls-overlay {
      opacity: 1;
      pointer-events: auto;
    }
    .image-display.gallery .display-container:not(:has(.display-video.active)) .video-controls-overlay {
      opacity: 0 !important;
      pointer-events: none !important;
    }

    /* Always-on blocker — sits between iframe and controls so YouTube never receives hover events */
    .video-iframe-blocker {
      position: absolute;
      inset: 0;
      background: transparent;
      z-index: 2;
      pointer-events: auto;
      cursor: default;
    }

    /* Full cover while YouTube player is loading — removed on onReady */
    .video-yt-loading-mask {
      position: absolute;
      inset: 0;
      background: #ffffff;
      pointer-events: none;
      z-index: 3;
    }

    /* Covers YouTube logo in top-left corner (shows when paused/interacted) */
    .video-yt-logo-mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 120px;
      height: 48px;
      background: linear-gradient(135deg, #ffffff 40%, transparent 100%);
      pointer-events: none;
      z-index: 3;
    }

    /* Click overlay — transparent, handles pause/resume on video click */
    .video-click-overlay {
      position: absolute;
      inset: 0;
      background: transparent;
      cursor: default;
      z-index: 5;
      pointer-events: auto;
    }

    /* Bottom control bar */
    .video-bottom-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      z-index: 11;
      pointer-events: auto;
    }

    .video-ctrl-left {
      display: flex;
      align-items: center;
      gap: 14px;
      color: white;
      font-size: 13px;
      font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
    }

    .video-ctrl-left .play-pause-btn,
    .video-ctrl-left .fullscreen-btn,
    .video-ctrl-left .mute-btn {
      background: none;
      border: none;
      color: white;
      font-size: 13px;
      font-family: inherit;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }

    .video-ctrl-left .play-pause-btn:hover,
    .video-ctrl-left .fullscreen-btn:hover,
    .video-ctrl-left .mute-btn:hover {
      opacity: 0.7;
    }

    .video-timestamp {
      color: white;
      font-size: 13px;
      font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
      white-space: nowrap;
    }

    /* Seek bar — right side */
    .video-seek-area {
      width: 22%;
      min-width: 80px;
      display: flex;
      align-items: center;
    }

    .video-seek-track {
      position: relative;
      width: 100%;
      height: 1px;
      background: rgba(255, 255, 255, 0.4);
      cursor: pointer;
    }

    .video-seek-track:hover {
      height: 2px;
    }

    .video-seek-fill {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: white;
      pointer-events: none;
      width: 0%;
    }

    .video-seek-handle {
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 7px;
      height: 7px;
      background: white;
      pointer-events: none;
      left: 0%;
    }

    /* Nav overlay for video galleries (iframes capture clicks) */
    .video-nav-overlay {
      position: absolute;
      inset: 0;
      background: transparent;
      cursor: pointer;
      z-index: 4;
    }
  `;
  document.head.appendChild(style);
}

// ─── Controls HTML ────────────────────────────────────────────────────────────

function createVideoControls(videoId, videoType) {
  return `
    <div class="video-controls-overlay" data-video-id="${videoId}" data-video-type="${videoType}" data-playing="false" data-muted="false">
      <div class="video-click-overlay" data-video-id="${videoId}" data-video-type="${videoType}"></div>
      <div class="video-bottom-bar">
        <div class="video-ctrl-left">
          <button class="play-pause-btn" data-video-id="${videoId}">Play</button>
          <button class="fullscreen-btn" data-video-id="${videoId}">Fullscreen</button>
          <button class="mute-btn" data-video-id="${videoId}">Unmute</button>
          <span class="video-timestamp" data-video-id="${videoId}">00:00/00:00</span>
        </div>
        <div class="video-seek-area" data-video-id="${videoId}">
          <div class="video-seek-track" data-video-id="${videoId}" data-video-type="${videoType}">
            <div class="video-seek-fill" data-video-id="${videoId}"></div>
            <div class="video-seek-handle" data-video-id="${videoId}"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ─── Single-video initializer ─────────────────────────────────────────────────

function initSingleVideoControls(iframe) {
  const container = iframe.closest('.video-container, .display-container');
  if (!container) return;

  const src = iframe.src;
  if (!src || !src.startsWith('http')) return;

  let videoType = null, videoId = null;
  if (src.includes('youtube.com') || src.includes('youtu.be')) {
    videoType = 'youtube';
    videoId = getVideoId(src, 'youtube');
  } else if (src.includes('vimeo.com')) {
    videoType = 'vimeo';
    videoId = getVideoId(src, 'vimeo');
  }
  if (!videoId) return;

  // If overlay already exists (e.g. another video in the same gallery container),
  // just initialize the player — activateVideoInGallery will rewire the overlay when needed.
  if (container.querySelector('.video-controls-overlay')) {
    if (videoType === 'youtube') initYouTubePlayerForIframe(iframe, videoId);
    else initVimeoPlayerForIframe(iframe, videoId);
    return;
  }

  // Detect initial state from URL params
  let isMuted = false, isAutoplay = false;
  try {
    const u = new URL(src);
    isMuted = u.searchParams.get('muted') === '1' || u.searchParams.get('mute') === '1';
    isAutoplay = u.searchParams.get('autoplay') === '1';
  } catch (e) {}

  container.style.position = 'relative';
  if (!container.querySelector('.video-iframe-blocker')) {
    const blocker = document.createElement('div');
    blocker.className = 'video-iframe-blocker';
    container.appendChild(blocker);
  }
  if (videoType === 'youtube') {
    if (!container.querySelector('.video-yt-loading-mask')) {
      const loadingMask = document.createElement('div');
      loadingMask.className = 'video-yt-loading-mask';
      container.appendChild(loadingMask);
    }
    if (!container.querySelector('.video-yt-logo-mask')) {
      const logoMask = document.createElement('div');
      logoMask.className = 'video-yt-logo-mask';
      container.appendChild(logoMask);
    }
  }
  container.insertAdjacentHTML('beforeend', createVideoControls(videoId, videoType));

  const overlay = container.querySelector('.video-controls-overlay');
  if (overlay) {
    overlay.dataset.muted = String(isMuted);
    overlay.dataset.playing = String(isAutoplay);
    const muteBtn = overlay.querySelector('.mute-btn');
    const playBtn = overlay.querySelector('.play-pause-btn');
    if (muteBtn) muteBtn.textContent = isMuted ? 'Unmute' : 'Mute';
    if (playBtn) playBtn.textContent = isAutoplay ? 'Pause' : 'Play';
  }

  // Attach listeners for the new controls
  setupControlsForOverlay(overlay);

  // Initialize player
  if (videoType === 'youtube') {
    initYouTubePlayerForIframe(iframe, videoId);
  } else {
    initVimeoPlayerForIframe(iframe, videoId);
  }

  setTimeout(() => updateVideoProgress(videoId, videoType), 500);
}

// Rewire the controls overlay to a different video in the same gallery container.
// Called by imageDisplay.js whenever the active video slide changes.
function activateVideoInGallery(container, iframe) {
  const src = iframe.src || iframe.getAttribute('data-src') || '';
  if (!src) return;

  let videoType = null, videoId = null;
  if (src.includes('youtube.com') || src.includes('youtu.be')) {
    videoType = 'youtube';
    videoId = getVideoId(src, 'youtube');
  } else if (src.includes('vimeo.com')) {
    videoType = 'vimeo';
    videoId = getVideoId(src, 'vimeo');
  }
  if (!videoId) return;

  const overlay = container.querySelector('.video-controls-overlay');
  if (!overlay) return;

  // Rewire all data attributes to the new video
  overlay.dataset.videoId   = videoId;
  overlay.dataset.videoType = videoType;
  overlay.dataset.playing   = 'false';
  overlay.dataset.muted     = 'false';
  overlay.querySelectorAll('[data-video-id]').forEach(el => el.dataset.videoId = videoId);
  overlay.querySelectorAll('[data-video-type]').forEach(el => el.dataset.videoType = videoType);

  // Reset UI
  const playBtn = overlay.querySelector('.play-pause-btn');
  const muteBtn = overlay.querySelector('.mute-btn');
  const ts      = overlay.querySelector('.video-timestamp');
  const fill    = overlay.querySelector('.video-seek-fill');
  const handle  = overlay.querySelector('.video-seek-handle');
  if (playBtn) playBtn.textContent = 'Play';
  if (muteBtn) muteBtn.textContent = 'Mute';
  if (ts)      ts.textContent = '00:00/00:00';
  if (fill)    fill.style.width = '0%';
  if (handle)  handle.style.left = '0%';

  setTimeout(() => updateVideoProgress(videoId, videoType), 300);
}

// ─── Main initializer ────────────────────────────────────────────────────────

function initVideoControls() {
  // Standalone .video-container iframes
  document.querySelectorAll('.video-container iframe').forEach(iframe => {
    if (iframe.src && iframe.src.startsWith('http')) initSingleVideoControls(iframe);
  });

  // Gallery .display-video iframes — may or may not have src yet
  document.querySelectorAll('.display-video').forEach(iframe => {
    if (iframe.src && iframe.src.startsWith('http')) {
      initSingleVideoControls(iframe);
    } else {
      // Watch for when the gallery makes this slide active
      const obs = new MutationObserver(() => {
        if (iframe.src && iframe.src.startsWith('http')) {
          obs.disconnect();
          setTimeout(() => initSingleVideoControls(iframe), 150);
        }
      });
      obs.observe(iframe, { attributes: true, attributeFilter: ['src'] });
    }
  });
}

// ─── Event listeners ─────────────────────────────────────────────────────────

// Attach listeners to buttons inside one overlay (called once per video)
function setupControlsForOverlay(overlay) {
  if (!overlay) return;
  const videoId = overlay.dataset.videoId;
  const videoType = overlay.dataset.videoType;

  // Play / Pause
  const playBtn = overlay.querySelector('.play-pause-btn');
  if (playBtn) {
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isPlaying = overlay.dataset.playing === 'true';
      togglePlayPause(videoId, videoType, isPlaying, overlay, playBtn);
    });
  }

  // Fullscreen
  const fsBtn = overlay.querySelector('.fullscreen-btn');
  if (fsBtn) {
    fsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = overlay.closest('.image-display, .video-container') || overlay.closest('.display-container');
      if (!target) return;
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        target.requestFullscreen?.();
      }
    });
  }

  // Mute / Unmute
  const muteBtn = overlay.querySelector('.mute-btn');
  if (muteBtn) {
    muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isMuted = overlay.dataset.muted === 'true';
      if (videoType === 'youtube' && window.ytPlayers?.[videoId]) {
        isMuted ? window.ytPlayers[videoId].unMute() : window.ytPlayers[videoId].mute();
      } else if (videoType === 'vimeo' && window.vimeoPlayers?.[videoId]) {
        isMuted ? window.vimeoPlayers[videoId].setVolume(1).catch(() => {}) : window.vimeoPlayers[videoId].setVolume(0).catch(() => {});
      }
      overlay.dataset.muted = String(!isMuted);
      muteBtn.textContent = isMuted ? 'Mute' : 'Unmute';
    });
  }

  // Seek bar — click + drag
  const track = overlay.querySelector('.video-seek-track');
  if (track) {
    let isDragging = false;

    const seek = (clientX) => {
      const rect = track.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      if (!window.videoSeeking) window.videoSeeking = {};
      window.videoSeeking[videoId] = true;
      // Immediate UI update
      const fill = track.querySelector('.video-seek-fill');
      const handle = track.querySelector('.video-seek-handle');
      if (fill) fill.style.width = (pct * 100) + '%';
      if (handle) handle.style.left = (pct * 100) + '%';
      performSeek(videoId, videoType, pct);
      setTimeout(() => { if (window.videoSeeking) window.videoSeeking[videoId] = false; }, 400);
    };

    track.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      isDragging = true;
      seek(e.clientX);
    });

    document.addEventListener('mousemove', (e) => { if (isDragging) seek(e.clientX); });
    document.addEventListener('mouseup', () => { isDragging = false; });
  }

  // Click overlay — pause/resume on video body click
  const clickOverlay = overlay.querySelector('.video-click-overlay');
  if (clickOverlay) {
    clickOverlay.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const isPlaying = overlay.dataset.playing === 'true';
      togglePlayPause(videoId, videoType, isPlaying, overlay, playBtn);
    });
  }
}

function togglePlayPause(videoId, videoType, isPlaying, overlay, btn) {
  if (videoType === 'youtube' && window.ytPlayers?.[videoId]) {
    isPlaying ? window.ytPlayers[videoId].pauseVideo() : window.ytPlayers[videoId].playVideo();
  } else if (videoType === 'vimeo' && window.vimeoPlayers?.[videoId]) {
    isPlaying ? window.vimeoPlayers[videoId].pause().catch(() => {}) : window.vimeoPlayers[videoId].play().catch(() => {});
  }
  if (overlay) overlay.dataset.playing = String(!isPlaying);
  if (btn) btn.textContent = isPlaying ? 'Play' : 'Pause';
}

// Legacy entry point (called from topic.html)
function setupVideoControlListeners() {}
function setupVideoClickHandlers() {}

// ─── Seek ─────────────────────────────────────────────────────────────────────

function performSeek(videoId, videoType, percent) {
  if (videoType === 'youtube') {
    const p = window.ytPlayers?.[videoId];
    if (!p) return;
    let dur = 0;
    try { dur = p.getDuration?.() || 0; } catch (e) {}
    if (!dur) dur = window.ytDurations?.[videoId] || 0;
    if (dur > 0) {
      const t = dur * percent;
      p.seekTo(t, true);
      if (!window.ytStartTimes) window.ytStartTimes = {};
      window.ytStartTimes[videoId] = Date.now() - t * 1000;
      const ts = document.querySelector(`.video-timestamp[data-video-id="${videoId}"]`);
      if (ts) ts.textContent = formatTime(t) + '/' + formatTime(dur);
    }
  } else if (videoType === 'vimeo') {
    const p = window.vimeoPlayers?.[videoId];
    if (!p) return;
    p.getDuration().then(dur => {
      if (dur > 0) {
        const t = dur * percent;
        p.setCurrentTime(t);
        const ts = document.querySelector(`.video-timestamp[data-video-id="${videoId}"]`);
        if (ts) ts.textContent = formatTime(t) + '/' + formatTime(dur);
      }
    }).catch(() => {});
  }
}

// ─── Progress updates ────────────────────────────────────────────────────────

function updateVideoProgress(videoId, videoType) {
  if (!window.videoProgressIntervals) window.videoProgressIntervals = {};
  if (window.videoProgressIntervals[videoId]) return;
  if (!window.ytStartTimes) window.ytStartTimes = {};

  const updateUI = (current, duration) => {
    if (window.videoSeeking?.[videoId]) return;
    const pct = duration > 0 ? Math.max(0, Math.min(100, (current / duration) * 100)) : 0;
    requestAnimationFrame(() => {
      if (window.videoSeeking?.[videoId]) return;
      const fill = document.querySelector(`.video-seek-fill[data-video-id="${videoId}"]`);
      const handle = document.querySelector(`.video-seek-handle[data-video-id="${videoId}"]`);
      const ts = document.querySelector(`.video-timestamp[data-video-id="${videoId}"]`);
      if (fill) fill.style.width = pct + '%';
      if (handle) handle.style.left = pct + '%';
      if (ts) ts.textContent = formatTime(current) + '/' + formatTime(duration);
    });
  };

  const update = () => {
    if (window.videoSeeking?.[videoId]) return;
    if (videoType === 'youtube' && window.ytPlayers?.[videoId]) {
      const p = window.ytPlayers[videoId];
      let current = 0, duration = 0;
      try {
        const t = p.getCurrentTime?.();
        if (t >= 0 && !isNaN(t)) {
          current = t;
          if (!window.ytStartTimes[videoId]) window.ytStartTimes[videoId] = Date.now() - t * 1000;
        }
      } catch (e) {}
      if (!current && window.ytStartTimes[videoId]) {
        current = Math.max(0, (Date.now() - window.ytStartTimes[videoId]) / 1000);
      }
      try {
        const d = p.getDuration?.();
        if (d > 0) { duration = d; if (!window.ytDurations) window.ytDurations = {}; window.ytDurations[videoId] = d; }
      } catch (e) {}
      if (!duration && window.ytDurations?.[videoId]) duration = window.ytDurations[videoId];
      if (duration > 0) updateUI(Math.min(current, duration), duration);
    } else if (videoType === 'vimeo' && window.vimeoPlayers?.[videoId]) {
      window.vimeoPlayers[videoId].getCurrentTime()
        .then(cur => window.vimeoPlayers[videoId].getDuration().then(dur => {
          if (!window.videoSeeking?.[videoId] && dur > 0 && !isNaN(cur)) updateUI(Math.min(cur, dur), dur);
        }))
        .catch(() => {});
    }
  };

  update();
  const interval = setInterval(() => {
    if (!document.querySelector(`.video-controls-overlay[data-video-id="${videoId}"]`)) {
      clearInterval(interval);
      delete window.videoProgressIntervals[videoId];
      return;
    }
    update();
  }, 100);
  window.videoProgressIntervals[videoId] = interval;
}

// ─── YouTube API ──────────────────────────────────────────────────────────────

function loadYouTubeAPI() {
  if (window.YT?.Player) return;
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.getElementsByTagName('script')[0].before(tag);
  window.onYouTubeIframeAPIReady = () => {
    document.querySelectorAll('iframe[src*="youtube"]').forEach(iframe => {
      const videoId = getVideoId(iframe.src, 'youtube');
      if (videoId) initYouTubePlayerForIframe(iframe, videoId);
    });
  };
}

function initYouTubePlayerForIframe(iframe, videoId) {
  if (!window.YT?.Player) return;
  if (window.ytPlayers?.[videoId]) return;
  window.ytPlayers = window.ytPlayers || {};
  window.ytDurations = window.ytDurations || {};

  try {
    const player = new window.YT.Player(iframe, {
      events: {
        onReady(e) {
          try {
            const dur = e.target.getDuration();
            if (dur > 0) window.ytDurations[videoId] = dur;
          } catch (err) {}
          // Remove loading cover now that the player is ready
          const c = iframe.closest('.video-container, .display-container');
          c?.querySelector('.video-yt-loading-mask')?.remove();
          updateVideoProgress(videoId, 'youtube');
        },
        onStateChange(e) {
          if (window.videoSeeking?.[videoId]) return;
          const overlay = document.querySelector(`.video-controls-overlay[data-video-id="${videoId}"]`);
          const btn = overlay?.querySelector('.play-pause-btn');
          if (e.data === window.YT.PlayerState.PLAYING) {
            if (overlay) overlay.dataset.playing = 'true';
            if (btn) btn.textContent = 'Pause';
            if (!window.ytStartTimes) window.ytStartTimes = {};
            try { window.ytStartTimes[videoId] = Date.now() - (e.target.getCurrentTime() || 0) * 1000; } catch (err) {}
            if (!window.videoProgressIntervals?.[videoId]) updateVideoProgress(videoId, 'youtube');
          } else {
            if (overlay) overlay.dataset.playing = 'false';
            if (btn) btn.textContent = 'Play';
          }
        }
      }
    });
    window.ytPlayers[videoId] = player;
  } catch (e) {
    // Remove loading cover even if player init failed
    const c = iframe.closest('.video-container, .display-container');
    c?.querySelector('.video-yt-loading-mask')?.remove();
    // Fallback: postMessage player
    window.ytPlayers[videoId] = {
      _send(func, args) {
        iframe.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: args ?? [] }), '*');
      },
      playVideo()   { this._send('playVideo'); },
      pauseVideo()  { this._send('pauseVideo'); },
      mute()        { this._send('mute'); },
      unMute()      { this._send('unMute'); },
      seekTo(s)     { this._send('seekTo', [s, true]); },
      getCurrentTime() { return 0; },
      getDuration()    { return window.ytDurations?.[videoId] || 0; },
      getPlayerState() { return -1; },
    };
    updateVideoProgress(videoId, 'youtube');
  }
}

// Legacy — called from topic.html setTimeout
function initYouTubePlayers() {
  if (!window.YT?.Player) { initYouTubePlayersPostMessage(); return; }
  document.querySelectorAll('iframe[src*="youtube"]').forEach(iframe => {
    const videoId = getVideoId(iframe.src, 'youtube');
    if (videoId) initYouTubePlayerForIframe(iframe, videoId);
  });
}

function initYouTubePlayersPostMessage() {
  window.ytPlayers = window.ytPlayers || {};
  window.ytDurations = window.ytDurations || {};
  document.querySelectorAll('iframe[src*="youtube"]').forEach(iframe => {
    const videoId = getVideoId(iframe.src, 'youtube');
    if (videoId && !window.ytPlayers[videoId]) {
      window.ytPlayers[videoId] = {
        _send(func, args) {
          iframe.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: args ?? [] }), '*');
        },
        playVideo()   { this._send('playVideo'); },
        pauseVideo()  { this._send('pauseVideo'); },
        mute()        { this._send('mute'); },
        unMute()      { this._send('unMute'); },
        seekTo(s)     { this._send('seekTo', [s, true]); },
        getCurrentTime() { return 0; },
        getDuration()    { return window.ytDurations?.[videoId] || 0; },
        getPlayerState() { return -1; },
      };
    }
  });
}

// ─── Vimeo API ────────────────────────────────────────────────────────────────

function loadVimeoAPI() {
  if (window.Vimeo?.Player) return;
  const tag = document.createElement('script');
  tag.src = 'https://player.vimeo.com/api/player.js';
  tag.onload = () => {
    document.querySelectorAll('iframe[src*="vimeo.com"]').forEach(iframe => {
      const videoId = getVideoId(iframe.src, 'vimeo');
      if (videoId) initVimeoPlayerForIframe(iframe, videoId);
    });
  };
  document.head.appendChild(tag);
}

function initVimeoPlayerForIframe(iframe, videoId) {
  if (!window.Vimeo?.Player) return;
  if (window.vimeoPlayers?.[videoId]) return;
  window.vimeoPlayers = window.vimeoPlayers || {};

  try {
    const player = new Vimeo.Player(iframe);
    window.vimeoPlayers[videoId] = player;

    let isAutoplay = false, isMutedFromUrl = false;
    try {
      const u = new URL(iframe.src);
      isAutoplay = u.searchParams.get('autoplay') === '1';
      isMutedFromUrl = u.searchParams.get('muted') === '1';
    } catch (e) {}

    player.on('play', () => {
      if (window.videoSeeking?.[videoId]) return;
      const overlay = document.querySelector(`.video-controls-overlay[data-video-id="${videoId}"]`);
      if (overlay) {
        overlay.dataset.playing = 'true';
        const btn = overlay.querySelector('.play-pause-btn');
        if (btn) btn.textContent = 'Pause';
      }
      if (!window.videoProgressIntervals?.[videoId]) updateVideoProgress(videoId, 'vimeo');
    });

    player.on('pause', () => {
      if (window.videoSeeking?.[videoId]) return;
      const overlay = document.querySelector(`.video-controls-overlay[data-video-id="${videoId}"]`);
      if (overlay) {
        overlay.dataset.playing = 'false';
        const btn = overlay.querySelector('.play-pause-btn');
        if (btn) btn.textContent = 'Play';
      }
    });

    if (isAutoplay) {
      player.ready().then(() => {
        if (isMutedFromUrl) player.setVolume(0).catch(() => {});
        player.play().catch(() => {});
      }).catch(() => {});
    }

    updateVideoProgress(videoId, 'vimeo');
  } catch (e) {}
}

// Legacy — called from topic.html setTimeout
function initVimeoPlayers() {
  if (!window.Vimeo?.Player) return;
  document.querySelectorAll('iframe[src*="vimeo.com"]').forEach(iframe => {
    const videoId = getVideoId(iframe.src, 'vimeo');
    if (videoId) initVimeoPlayerForIframe(iframe, videoId);
  });
}

// ─── Video gallery (createVideoGallery) ─────────────────────────────────────

function createVideoGallery(videos, options = {}) {
  if (!videos || videos.length === 0) return '';
  const displayId = options.id || `video-gallery-${Date.now()}`;

  if (!window.videoImageStyleApplied) {
    applyVideoImageStyle();
    window.videoImageStyleApplied = true;
  }

  loadYouTubeAPI();
  loadVimeoAPI();

  const escapeAttr = (str) => String(str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  const videoElements = videos.map((video, index) => {
    let src = ensureVideoNoInterface(video.src);
    src = escapeAttr(src);
    const title = escapeAttr(video.title || 'Video');
    const allow = escapeAttr(video.allow || 'autoplay; fullscreen; picture-in-picture');
    return `<iframe src="${src}"
            class="display-video ${index === 0 ? 'active' : ''}"
            title="${title}"
            frameborder="0"
            allow="${allow}"
            allowfullscreen>
            </iframe>`;
  }).join('\n');

  return `
    <div class="image-display gallery" data-display-id="${displayId}">
      <div class="display-container">
        ${videoElements}
        <button class="display-nav prev" data-display-id="${displayId}" style="display: none;">&lt;</button>
        <button class="display-nav next" data-display-id="${displayId}" style="display: none;">&gt;</button>
      </div>
      <div class="gallery-counter" data-display-id="${displayId}">1/${videos.length}</div>
    </div>
  `;
}
