/**
 * Video Controls Module
 * Provides functions for creating video galleries, managing video controls, and handling YouTube/Vimeo APIs
 */

// Function to ensure video URLs have all parameters to hide interfaces
function ensureVideoNoInterface(url) {
  if (!url) return url;
  
  // Check if it's a YouTube URL
  if (url.includes('youtube.com/embed') || url.includes('youtu.be')) {
    const urlObj = new URL(url);
    // Ensure all interface-hiding parameters are present
    urlObj.searchParams.set('controls', '0');
    urlObj.searchParams.set('modestbranding', '1');
    urlObj.searchParams.set('rel', '0');
    urlObj.searchParams.set('showinfo', '0');
    urlObj.searchParams.set('iv_load_policy', '3');
    urlObj.searchParams.set('fs', '0'); // Disable fullscreen button
    urlObj.searchParams.set('disablekb', '1'); // Disable keyboard controls
    urlObj.searchParams.set('playsinline', '1');
    urlObj.searchParams.set('enablejsapi', '1'); // Enable JavaScript API for controls
    return urlObj.toString();
  }
  
  // Check if it's a Vimeo URL
  if (url.includes('vimeo.com')) {
    // Handle both player.vimeo.com and vimeo.com URLs
    let urlStr = url;
    if (url.includes('vimeo.com/video/') && !url.includes('player.vimeo.com')) {
      // Convert vimeo.com/video/ID to player.vimeo.com/video/ID
      const videoIdMatch = url.match(/vimeo\.com\/video\/(\d+)/);
      if (videoIdMatch) {
        urlStr = `https://player.vimeo.com/video/${videoIdMatch[1]}`;
      }
    }
    const urlObj = new URL(urlStr);
    // Ensure all interface-hiding parameters are present
    urlObj.searchParams.set('controls', '0');
    urlObj.searchParams.set('title', '0');
    urlObj.searchParams.set('byline', '0');
    urlObj.searchParams.set('portrait', '0');
    urlObj.searchParams.set('badge', '0');
    urlObj.searchParams.set('autopause', '0');
    return urlObj.toString();
  }
  
  return url;
}

// Function to apply video styling that makes videos look like images
function applyVideoImageStyle() {
  // Add CSS to hide all video controls and interfaces
  const style = document.createElement('style');
  style.textContent = `
    /* Hide all video interfaces and make videos look like images */
    .display-video,
    .video-container iframe {
      pointer-events: auto !important;
      object-fit: cover;
    }
    
    /* Hide YouTube controls overlay */
    .display-video[src*="youtube"]::after,
    .video-container iframe[src*="youtube"]::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      pointer-events: none;
      z-index: 1;
    }
    
    /* Custom video controls overlay */
    .video-controls-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%);
      padding: 20px;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
      z-index: 10;
    }
    
    .video-container:hover .video-controls-overlay,
    .image-display.gallery .display-container:hover .video-controls-overlay {
      opacity: 1;
      pointer-events: auto;
    }
    
    .video-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      max-width: 100%;
    }
    
    .video-control-btn {
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: 4px;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 16px;
      color: #333;
      transition: background 0.2s;
      flex-shrink: 0;
    }
    
    .video-control-btn:hover {
      background: rgba(255, 255, 255, 1);
    }
    
    .video-progress-container {
      flex: 1;
      height: 4px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
      cursor: pointer;
      position: relative;
      min-width: 100px;
    }
    
    .video-progress-bar {
      height: 100%;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 2px;
      width: 0%;
      transition: width 0.1s linear;
    }
    
    .video-time {
      color: white;
      font-size: 12px;
      white-space: nowrap;
      flex-shrink: 0;
      min-width: 80px;
      text-align: right;
    }
    
    /* Prevent hover interactions on video containers */
    .image-display.gallery .display-container:has(.display-video) {
      cursor: default;
    }
    
    /* Make videos in gallery look exactly like images but still playable */
    .image-display.gallery .display-video {
      pointer-events: auto !important;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }
    
    /* Show controls on hover */
    .image-display.gallery .display-container:hover .video-controls-overlay {
      opacity: 1;
      pointer-events: auto;
    }
  `;
  document.head.appendChild(style);
}

// Function to create video controls HTML
function createVideoControls(videoId, videoType) {
  return `
    <div class="video-controls-overlay" data-video-id="${videoId}" data-video-type="${videoType}">
      <div class="video-controls">
        <button class="video-control-btn play-pause-btn" data-video-id="${videoId}" title="Play/Pause">
          <span class="play-icon">▶</span>
          <span class="pause-icon" style="display: none;">⏸</span>
        </button>
        <button class="video-control-btn mute-btn" data-video-id="${videoId}" title="Mute/Unmute">
          <span class="mute-icon">🔊</span>
          <span class="unmute-icon" style="display: none;">🔇</span>
        </button>
        <div class="video-progress-container" data-video-id="${videoId}">
          <div class="video-progress-bar" data-video-id="${videoId}"></div>
        </div>
        <div class="video-time" data-video-id="${videoId}">0:00 / 0:00</div>
      </div>
    </div>
  `;
}

// Function to extract video ID from URL
function getVideoId(url, type) {
  if (type === 'youtube') {
    const match = url.match(/(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([^&\s]+)/);
    return match ? match[1] : null;
  } else if (type === 'vimeo') {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : null;
  }
  return null;
}

// Function to initialize video controls
function initVideoControls() {
  // Initialize controls for video containers
  document.querySelectorAll('.video-container iframe').forEach(iframe => {
    const container = iframe.closest('.video-container');
    if (container && !container.querySelector('.video-controls-overlay')) {
      const src = iframe.src;
      let videoType = 'youtube';
      let videoId = null;
      
      if (src.includes('youtube.com') || src.includes('youtu.be')) {
        videoType = 'youtube';
        videoId = getVideoId(src, 'youtube');
      } else if (src.includes('vimeo.com')) {
        videoType = 'vimeo';
        videoId = getVideoId(src, 'vimeo');
      }
      
      if (videoId) {
        container.style.position = 'relative';
        container.insertAdjacentHTML('beforeend', createVideoControls(videoId, videoType));
      }
    }
  });
  
  // Initialize controls for video galleries
  document.querySelectorAll('.display-video').forEach(iframe => {
    const container = iframe.closest('.display-container');
    if (container && !container.querySelector('.video-controls-overlay')) {
      const src = iframe.src;
      let videoType = 'youtube';
      let videoId = null;
      
      if (src.includes('youtube.com') || src.includes('youtu.be')) {
        videoType = 'youtube';
        videoId = getVideoId(src, 'youtube');
      } else if (src.includes('vimeo.com')) {
        videoType = 'vimeo';
        videoId = getVideoId(src, 'vimeo');
      }
      
      if (videoId) {
        container.style.position = 'relative';
        container.insertAdjacentHTML('beforeend', createVideoControls(videoId, videoType));
      }
    }
  });
  
  // Set up control event listeners
  setupVideoControlListeners();
}

// Function to setup video control event listeners
function setupVideoControlListeners() {
  // Play/Pause button
  document.querySelectorAll('.play-pause-btn').forEach(btn => {
    // Remove existing listeners to avoid duplicates
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const videoId = newBtn.dataset.videoId;
      const overlay = newBtn.closest('.video-controls-overlay');
      const videoType = overlay.dataset.videoType;
      
      if (videoType === 'youtube' && window.ytPlayers && window.ytPlayers[videoId]) {
        const player = window.ytPlayers[videoId];
        // Toggle play/pause - we'll track state manually since postMessage doesn't return state
        const isPlaying = newBtn.querySelector('.pause-icon').style.display !== 'none';
        if (isPlaying) {
          player.pauseVideo();
          newBtn.querySelector('.play-icon').style.display = 'inline';
          newBtn.querySelector('.pause-icon').style.display = 'none';
        } else {
          player.playVideo();
          newBtn.querySelector('.play-icon').style.display = 'none';
          newBtn.querySelector('.pause-icon').style.display = 'inline';
        }
      } else if (videoType === 'vimeo' && window.Vimeo) {
        const player = window.vimeoPlayers && window.vimeoPlayers[videoId];
        if (player) {
          player.getPaused().then(paused => {
            if (paused) {
              player.play();
              newBtn.querySelector('.play-icon').style.display = 'none';
              newBtn.querySelector('.pause-icon').style.display = 'inline';
            } else {
              player.pause();
              newBtn.querySelector('.play-icon').style.display = 'inline';
              newBtn.querySelector('.pause-icon').style.display = 'none';
            }
          });
        }
      }
    });
  });
  
  // Mute button
  document.querySelectorAll('.mute-btn').forEach(btn => {
    // Remove existing listeners to avoid duplicates
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const videoId = newBtn.dataset.videoId;
      const overlay = newBtn.closest('.video-controls-overlay');
      const videoType = overlay.dataset.videoType;
      
      if (videoType === 'youtube' && window.ytPlayers && window.ytPlayers[videoId]) {
        const player = window.ytPlayers[videoId];
        // Toggle mute - we'll track state manually
        const isMuted = newBtn.querySelector('.unmute-icon').style.display !== 'none';
        if (isMuted) {
          player.unMute();
          newBtn.querySelector('.mute-icon').style.display = 'inline';
          newBtn.querySelector('.unmute-icon').style.display = 'none';
        } else {
          player.mute();
          newBtn.querySelector('.mute-icon').style.display = 'none';
          newBtn.querySelector('.unmute-icon').style.display = 'inline';
        }
      } else if (videoType === 'vimeo' && window.Vimeo) {
        const player = window.vimeoPlayers && window.vimeoPlayers[videoId];
        if (player) {
          player.getVolume().then(volume => {
            if (volume === 0) {
              player.setVolume(1);
              newBtn.querySelector('.mute-icon').style.display = 'inline';
              newBtn.querySelector('.unmute-icon').style.display = 'none';
            } else {
              player.setVolume(0);
              newBtn.querySelector('.mute-icon').style.display = 'none';
              newBtn.querySelector('.unmute-icon').style.display = 'inline';
            }
          });
        }
      }
    });
  });
  
  // Progress bar
  document.querySelectorAll('.video-progress-container').forEach(container => {
    // Remove existing listeners to avoid duplicates
    const newContainer = container.cloneNode(true);
    container.parentNode.replaceChild(newContainer, container);
    
    newContainer.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = newContainer.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const videoId = newContainer.dataset.videoId;
      const overlay = newContainer.closest('.video-controls-overlay');
      const videoType = overlay.dataset.videoType;
      
      if (videoType === 'youtube' && window.ytPlayers && window.ytPlayers[videoId]) {
        const player = window.ytPlayers[videoId];
        // For YouTube, we need to estimate duration or use a default
        // Since we can't get duration via postMessage, we'll use a reasonable estimate
        const estimatedDuration = 60; // Default to 60 seconds, will be updated if available
        player.seekTo(estimatedDuration * percent);
      } else if (videoType === 'vimeo' && window.Vimeo) {
        const player = window.vimeoPlayers && window.vimeoPlayers[videoId];
        if (player) {
          player.getDuration().then(duration => {
            player.setCurrentTime(duration * percent);
          });
        }
      }
    });
  });
}

// Load YouTube IFrame API
function loadYouTubeAPI() {
  if (window.YT && window.YT.Player) return;
  
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  
  window.onYouTubeIframeAPIReady = function() {
    initYouTubePlayers();
  };
}

// Initialize YouTube players using postMessage API
function initYouTubePlayers() {
  if (!window.YT || !window.YT.Player) {
    // Fallback: Use postMessage API for existing iframes
    initYouTubePlayersPostMessage();
    return;
  }
  
  window.ytPlayers = window.ytPlayers || {};
  
  document.querySelectorAll('iframe[src*="youtube"]').forEach(iframe => {
    const src = iframe.src;
    const videoId = getVideoId(src, 'youtube');
    if (videoId && !window.ytPlayers[videoId]) {
      // For existing iframes, we'll use postMessage API
      // Store reference to iframe for postMessage communication
      window.ytPlayers[videoId] = {
        iframe: iframe,
        videoId: videoId,
        postMessage: function(action, value) {
          if (this.iframe && this.iframe.contentWindow) {
            this.iframe.contentWindow.postMessage(JSON.stringify({
              event: 'command',
              func: action,
              args: value !== undefined ? [value] : []
            }), '*');
          }
        },
        playVideo: function() { this.postMessage('playVideo'); },
        pauseVideo: function() { this.postMessage('pauseVideo'); },
        mute: function() { this.postMessage('mute'); },
        unMute: function() { this.postMessage('unMute'); },
        seekTo: function(seconds) { this.postMessage('seekTo', seconds); },
        getCurrentTime: function() { return 0; }, // Can't get this via postMessage easily
        getDuration: function() { return 0; }, // Can't get this via postMessage easily
        getPlayerState: function() { return -1; }, // Can't get this via postMessage easily
        isMuted: function() { return false; } // Can't get this via postMessage easily
      };
    }
  });
}

// Fallback postMessage initialization
function initYouTubePlayersPostMessage() {
  window.ytPlayers = window.ytPlayers || {};
  
  document.querySelectorAll('iframe[src*="youtube"]').forEach(iframe => {
    const src = iframe.src;
    const videoId = getVideoId(src, 'youtube');
    if (videoId && !window.ytPlayers[videoId]) {
      window.ytPlayers[videoId] = {
        iframe: iframe,
        videoId: videoId,
        postMessage: function(action, value) {
          if (this.iframe && this.iframe.contentWindow) {
            this.iframe.contentWindow.postMessage(JSON.stringify({
              event: 'command',
              func: action,
              args: value !== undefined ? [value] : []
            }), '*');
          }
        },
        playVideo: function() { this.postMessage('playVideo'); },
        pauseVideo: function() { this.postMessage('pauseVideo'); },
        mute: function() { this.postMessage('mute'); },
        unMute: function() { this.postMessage('unMute'); },
        seekTo: function(seconds) { this.postMessage('seekTo', seconds); },
        getCurrentTime: function() { return 0; },
        getDuration: function() { return 0; },
        getPlayerState: function() { return -1; },
        isMuted: function() { return false; }
      };
    }
  });
}

// Load Vimeo Player API
function loadVimeoAPI() {
  if (window.Vimeo && window.Vimeo.Player) return;
  
  const tag = document.createElement('script');
  tag.src = 'https://player.vimeo.com/api/player.js';
  tag.onload = () => {
    initVimeoPlayers();
  };
  document.head.appendChild(tag);
}

// Initialize Vimeo players
function initVimeoPlayers() {
  if (!window.Vimeo || !window.Vimeo.Player) return;
  
  window.vimeoPlayers = window.vimeoPlayers || {};
  
  document.querySelectorAll('iframe[src*="vimeo.com"]').forEach(iframe => {
    const src = iframe.src;
    const videoId = getVideoId(src, 'vimeo');
    if (videoId && !window.vimeoPlayers[videoId]) {
      try {
        const player = new Vimeo.Player(iframe);
        window.vimeoPlayers[videoId] = player;
        
        player.on('play', () => {
          const overlay = iframe.closest('.video-container, .display-container');
          if (overlay) {
            const playBtn = overlay.querySelector('.play-pause-btn');
            if (playBtn) {
              playBtn.querySelector('.play-icon').style.display = 'none';
              playBtn.querySelector('.pause-icon').style.display = 'inline';
            }
          }
        });
        
        player.on('pause', () => {
          const overlay = iframe.closest('.video-container, .display-container');
          if (overlay) {
            const playBtn = overlay.querySelector('.play-pause-btn');
            if (playBtn) {
              playBtn.querySelector('.play-icon').style.display = 'inline';
              playBtn.querySelector('.pause-icon').style.display = 'none';
            }
          }
        });
        
        updateVideoProgress(videoId, 'vimeo');
      } catch (e) {
        console.warn('Failed to initialize Vimeo player:', e);
      }
    }
  });
}

// Update video progress bar and time
function updateVideoProgress(videoId, videoType) {
  const overlay = document.querySelector(`.video-controls-overlay[data-video-id="${videoId}"]`);
  if (!overlay) return;
  
  const progressBar = overlay.querySelector('.video-progress-bar');
  const timeDisplay = overlay.querySelector('.video-time');
  if (!progressBar || !timeDisplay) return;
  
  const update = () => {
    if (videoType === 'youtube' && window.ytPlayers && window.ytPlayers[videoId]) {
      // YouTube postMessage API doesn't easily support getting current time/duration
      // So we'll show a placeholder or skip updating for YouTube
      // Progress will still work via clicking the bar
      if (progressBar.style.width === '0%' || !progressBar.style.width) {
        timeDisplay.textContent = '0:00 / --:--';
      }
    } else if (videoType === 'vimeo' && window.vimeoPlayers && window.vimeoPlayers[videoId]) {
      const player = window.vimeoPlayers[videoId];
      Promise.all([player.getCurrentTime(), player.getDuration()]).then(([current, duration]) => {
        if (duration && !isNaN(current) && !isNaN(duration)) {
          const percent = (current / duration) * 100;
          progressBar.style.width = percent + '%';
          timeDisplay.textContent = formatTime(current) + ' / ' + formatTime(duration);
        }
      }).catch(() => {
        // Player not ready
      });
    }
  };
  
  update();
  const interval = setInterval(update, 100);
  
  // Store interval to clear later if needed
  if (!window.videoProgressIntervals) window.videoProgressIntervals = {};
  window.videoProgressIntervals[videoId] = interval;
}

// Format time in MM:SS format
function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

// Create video gallery function
function createVideoGallery(videos, options = {}) {
  if (!videos || videos.length === 0) return '';
  const displayId = options.id || `video-gallery-${Date.now()}`;
  
  // Apply video styling on first call
  if (!window.videoImageStyleApplied) {
    applyVideoImageStyle();
    window.videoImageStyleApplied = true;
  }
  
  // Load video APIs
  loadYouTubeAPI();
  loadVimeoAPI();
  
  const escapeAttr = (str) => {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;')
                      .replace(/"/g, '&quot;');
  };
  
  const videoElements = videos.map((video, index) => {
    // Ensure video URL has all parameters to hide interfaces
    let src = ensureVideoNoInterface(video.src);
    src = escapeAttr(src);
    const title = escapeAttr(video.title || 'Video');
    const allow = escapeAttr(video.allow || 'autoplay; fullscreen; picture-in-picture');
    
    // Get video ID for controls
    let videoType = 'youtube';
    let videoId = null;
    if (src.includes('youtube.com') || src.includes('youtu.be')) {
      videoType = 'youtube';
      videoId = getVideoId(src, 'youtube');
    } else if (src.includes('vimeo.com')) {
      videoType = 'vimeo';
      videoId = getVideoId(src, 'vimeo');
    }
    
    return `<iframe src="${src}" 
            class="display-video ${index === 0 ? 'active' : ''}" 
            data-video-id="${videoId || ''}"
            data-video-type="${videoType}"
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
        <button class="display-nav prev" data-display-id="${displayId}">‹</button>
        <button class="display-nav next" data-display-id="${displayId}">›</button>
      </div>
    </div>
  `;
}

