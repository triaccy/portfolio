/**
 * Video Controls Module
 * Provides functions for creating video galleries, managing video controls, and handling YouTube/Vimeo APIs
 * Version: 4 - Updated button styling and structure
 */
console.log('videoControls.js loaded - Version 5');

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
      object-fit: contain;
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
    
    /* Custom video controls overlay - for duration bar only */
    .video-controls-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
      z-index: 10;
    }
    
    /* Show duration bar on hover */
    .video-container:hover .video-controls-overlay,
    .image-display.gallery .display-container:hover .video-controls-overlay {
      opacity: 1;
      pointer-events: auto;
    }
    
    /* Playback bar in the middle - shows on hover */
    .video-progress-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: auto;
      width: calc(100% - 80px);
      max-width: 600px;
      min-width: 250px;
      display: block;
      z-index: 11;
    }
    
    /* Make duration bar responsive to video container size */
    .video-container .video-progress-overlay {
      max-width: calc(var(--video-width, 720px) - 80px);
    }
    
    @media (max-width: 768px) {
      .video-progress-overlay {
        width: calc(100% - 40px);
        min-width: 200px;
      }
    }
    
    .video-progress-wrapper {
      display: flex !important;
      align-items: center;
      gap: 12px;
      background: rgba(60, 60, 60, 0.85);
      padding: 12px 16px;
      border-radius: 4px;
      width: 100%;
      box-sizing: border-box;
      visibility: visible !important;
      opacity: 1 !important;
    }
    
    .video-progress-container {
      flex: 1;
      height: 3px;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      z-index: 11;
    }
    
    .video-progress-container:hover {
      height: 4px;
    }
    
    .video-progress-bar {
      height: 100%;
      background: #000;
      border-radius: 6px;
      width: 0%;
      transition: width 0.1s linear;
    }
    
    .video-time {
      color: white;
      font-size: 14px;
      white-space: nowrap;
      flex-shrink: 0;
      min-width: 50px;
      text-align: left;
      font-family: monospace;
    }
    
    /* Controls at the bottom - hidden (buttons removed) */
    .video-controls {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
    }
    
    /* Video wrapper to contain video and controls */
    .video-wrapper {
      display: flex;
      flex-direction: column;
    }
    
    .video-control-btn {
      background: rgba(60, 60, 60, 0.85);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      color: white;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background-color 0.2s;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      white-space: nowrap;
    }
    
    .video-control-btn:hover {
      background: rgba(80, 80, 80, 0.85);
    }
    
    .video-control-btn .play-icon,
    .video-control-btn .pause-icon {
      display: inline-block;
      width: 12px;
      height: 12px;
      position: relative;
      margin-left: 4px;
    }
    
    /* Play icon - triangle pointing right */
    .video-control-btn .play-icon::after {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-left: 8px solid white;
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
    }
    
    /* Pause icon - two vertical lines */
    .video-control-btn .pause-icon::before,
    .video-control-btn .pause-icon::after {
      content: '';
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 12px;
      background: white;
    }
    
    .video-control-btn .pause-icon::before {
      left: 2px;
    }
    
    .video-control-btn .pause-icon::after {
      right: 2px;
    }
    
    .video-control-btn .mute-icon,
    .video-control-btn .unmute-icon {
      display: inline-block;
      width: 14px;
      height: 14px;
      position: relative;
      margin-right: 4px;
    }
    
    /* Mute icon - speaker with sound waves */
    .video-control-btn .mute-icon::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 8px;
      height: 8px;
      border: 2px solid white;
      border-right: none;
      border-radius: 2px 0 0 2px;
    }
    
    .video-control-btn .mute-icon::after {
      content: '';
      position: absolute;
      right: -2px;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-left: 6px solid white;
      border-top: 4px solid transparent;
      border-bottom: 4px solid transparent;
    }
    
    /* Unmute icon - speaker with X */
    .video-control-btn .unmute-icon::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 8px;
      height: 8px;
      border: 2px solid white;
      border-right: none;
      border-radius: 2px 0 0 2px;
    }
    
    .video-control-btn .unmute-icon::after {
      content: 'X';
      position: absolute;
      right: -4px;
      top: 50%;
      transform: translateY(-50%);
      color: white;
      font-size: 14px;
      line-height: 1;
      font-weight: bold;
    }
    
    /* Combined button for Sound and Turn off */
    .video-controls-combined {
      background: rgba(60, 60, 60, 0.85);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      color: white;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      transition: background-color 0.2s;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    
    .video-controls-combined:hover {
      background: rgba(80, 80, 80, 0.85);
    }
    
    .video-controls-combined .sound-btn,
    .video-controls-combined .turn-off-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 14px;
      color: white;
      padding: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    
    .video-controls-combined .sound-btn:hover,
    .video-controls-combined .turn-off-btn:hover {
      opacity: 0.7;
    }
    
    /* Prevent hover interactions on video containers - use same cursor as image galleries */
    .image-display.gallery .display-container:has(.display-video) {
      cursor: ew-resize;
    }
    
    /* Make videos in gallery look exactly like images but still playable */
    .image-display.gallery .display-video {
      pointer-events: auto !important;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      object-fit: contain;
    }
    
    /* Show controls on hover */
    .image-display.gallery .display-container:hover .video-controls-overlay {
      opacity: 1;
      pointer-events: auto;
    }
    
    /* Navigation overlay for video galleries - allows clicking to navigate */
    .video-nav-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      cursor: pointer;
      z-index: 4;
      pointer-events: auto;
    }
    
    /* Make sure video controls are above navigation overlay */
    .video-controls-overlay {
      z-index: 10 !important;
    }
    
    /* Clickable overlay for pause/resume - covers entire video area */
    .video-click-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: transparent;
      cursor: inherit;
      z-index: 5;
      pointer-events: auto;
    }
    
    /* Progress overlay should be above click overlay */
    .video-progress-overlay {
      z-index: 11 !important;
    }
  `;
  document.head.appendChild(style);
}

// Function to create video controls HTML
function createVideoControls(videoId, videoType) {
  return `
    <div class="video-controls-overlay" data-video-id="${videoId}" data-video-type="${videoType}">
      <!-- Clickable area for pause/resume - covers entire video -->
      <div class="video-click-overlay" data-video-id="${videoId}" data-video-type="${videoType}"></div>
      <!-- Playback bar in the middle - appears on hover -->
      <div class="video-progress-overlay">
        <div class="video-progress-wrapper">
          <div class="video-time" data-video-id="${videoId}" style="min-width: 70px;">00:00</div>
          <div class="video-progress-container" data-video-id="${videoId}">
            <div class="video-progress-bar" data-video-id="${videoId}"></div>
          </div>
          <div class="video-time" data-video-id="${videoId}" style="min-width: 70px; text-align: right;">00:00</div>
        </div>
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
    // Match both player.vimeo.com/video/ID and vimeo.com/video/ID
    const match = url.match(/(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : null;
  }
  return null;
}

// Function to initialize video controls
function initVideoControls() {
  console.log('Initializing video controls...', new Date().toISOString());
  let controlsAdded = 0;
  
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
        // Insert overlay inside container, controls after container
        const controlsHTML = createVideoControls(videoId, videoType);
        console.log('Created controls HTML for', videoId, ':', controlsHTML.substring(0, 200));
        // Insert overlay inside container
        container.insertAdjacentHTML('beforeend', controlsHTML);
        controlsAdded++;
        console.log(`Added video controls to container: ${videoType} ${videoId}`, new Date().toISOString());
      } else {
        console.warn('No video ID found for iframe:', src);
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
        // Insert overlay inside container, controls after container
        const controlsHTML = createVideoControls(videoId, videoType);
        console.log('Created gallery controls HTML for', videoId);
        // Insert overlay inside container
        container.insertAdjacentHTML('beforeend', controlsHTML);
        console.log(`Added video controls to gallery video: ${videoType} ${videoId}`);
        
        // Set cursor for video galleries (same as image galleries)
        const allVideos = container.querySelectorAll('.display-video');
        if (allVideos.length > 1) {
          container.style.cursor = 'ew-resize';
        } else {
          container.style.cursor = 'default';
        }
        
        // Start progress updates for gallery videos
        // Wait a bit for player to be ready, then start updates
        setTimeout(() => {
          updateVideoProgress(videoId, videoType);
        }, 500);
      } else {
        console.warn('Could not extract video ID from:', src);
      }
    }
  });
  
  // Set up control event listeners
  setupVideoControlListeners();
  
  // Add click-to-pause/resume for videos (call after a short delay to ensure overlays exist)
  setTimeout(() => {
    setupVideoClickHandlers();
  }, 100);
  
  // Start progress updates for all video containers as well
  document.querySelectorAll('.video-container iframe').forEach(iframe => {
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
      // Wait a bit for player to be ready, then start updates
      setTimeout(() => {
        updateVideoProgress(videoId, videoType);
      }, 500);
    }
  });
  
  console.log(`Video controls initialization complete. Added controls to ${controlsAdded} video containers and ${document.querySelectorAll('.display-video').length} gallery videos.`);
}

// Function to setup click-to-pause/resume handlers
function setupVideoClickHandlers() {
  // Handle clicks on the click overlay to toggle play/pause
  document.querySelectorAll('.video-click-overlay').forEach(overlay => {
    const videoId = overlay.dataset.videoId;
    const videoType = overlay.dataset.videoType || 'youtube';
    
    if (!videoId) return;
    
    const clickHandler = (e) => {
      // Don't toggle if clicking on progress bar
      if (e.target.closest('.video-progress-container') ||
          e.target.closest('.video-progress-wrapper') ||
          e.target.closest('.video-progress-overlay')) {
        return;
      }
      
      e.stopPropagation();
      e.preventDefault();
      
      // Toggle play/pause
      if (videoType === 'youtube' && window.ytPlayers && window.ytPlayers[videoId]) {
        const player = window.ytPlayers[videoId];
        if (player.getPlayerState && typeof player.getPlayerState === 'function') {
          try {
            const state = player.getPlayerState();
            if (state === window.YT.PlayerState.PLAYING) {
              player.pauseVideo();
            } else {
              player.playVideo();
            }
          } catch (e) {
            // Fallback: try to toggle
            try {
              player.pauseVideo();
              setTimeout(() => {
                try {
                  player.playVideo();
                } catch (e2) {
                  console.warn('Could not play YouTube video:', e2);
                }
              }, 100);
            } catch (e1) {
              console.warn('Could not pause YouTube video:', e1);
            }
          }
        } else {
          // Fallback for postMessage API - toggle
          try {
            player.pauseVideo();
            setTimeout(() => {
              try {
                player.playVideo();
              } catch (e2) {
                console.warn('Could not play YouTube video:', e2);
              }
            }, 100);
          } catch (e1) {
            console.warn('Could not toggle YouTube video:', e1);
          }
        }
      } else if (videoType === 'vimeo' && window.vimeoPlayers && window.vimeoPlayers[videoId]) {
        const player = window.vimeoPlayers[videoId];
        player.getPaused().then(paused => {
          if (paused) {
            player.play().catch(e => {
              console.warn('Could not play Vimeo video:', e);
            });
          } else {
            player.pause().catch(e => {
              console.warn('Could not pause Vimeo video:', e);
            });
          }
        }).catch(e => {
          console.warn('Could not get Vimeo video state:', e);
        });
      }
    };
    
    // Remove existing handler if any
    overlay.removeEventListener('click', clickHandler);
    overlay.addEventListener('click', clickHandler);
  });
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
      const controlsDiv = newBtn.closest('.video-controls');
      const videoType = controlsDiv ? controlsDiv.dataset.videoType : (newBtn.closest('.video-controls-overlay')?.dataset.videoType || 'youtube');
      
      if (videoType === 'youtube' && window.ytPlayers && window.ytPlayers[videoId]) {
        const player = window.ytPlayers[videoId];
        // Toggle play/pause - we'll track state manually since postMessage doesn't return state
        const isPlaying = newBtn.querySelector('.pause-icon').style.display !== 'none';
            if (isPlaying) {
              player.pauseVideo();
              newBtn.querySelector('.play-icon').style.display = 'inline-block';
              newBtn.querySelector('.pause-icon').style.display = 'none';
              const playText = newBtn.querySelector('.play-text');
              const pauseText = newBtn.querySelector('.pause-text');
              if (playText) playText.style.display = 'inline';
              if (pauseText) pauseText.style.display = 'none';
            } else {
              player.playVideo();
              // Track start time for time estimation
              if (!window.ytStartTimes) window.ytStartTimes = {};
              // Get current time if available, otherwise start from 0
              let startTime = 0;
              if (player.getCurrentTime && typeof player.getCurrentTime === 'function') {
                try {
                  startTime = player.getCurrentTime() || 0;
                } catch (e) {
                  startTime = 0;
                }
              }
              window.ytStartTimes[videoId] = Date.now() - (startTime * 1000);
              newBtn.querySelector('.play-icon').style.display = 'none';
              newBtn.querySelector('.pause-icon').style.display = 'inline-block';
              const playText = newBtn.querySelector('.play-text');
              const pauseText = newBtn.querySelector('.pause-text');
              if (playText) playText.style.display = 'none';
              if (pauseText) pauseText.style.display = 'inline';
            }
      } else if (videoType === 'vimeo' && window.Vimeo) {
        const player = window.vimeoPlayers && window.vimeoPlayers[videoId];
        if (player) {
          player.getPaused().then(paused => {
            if (paused) {
              player.play();
              newBtn.querySelector('.play-icon').style.display = 'none';
              newBtn.querySelector('.pause-icon').style.display = 'inline-block';
              const playText = newBtn.querySelector('.play-text');
              const pauseText = newBtn.querySelector('.pause-text');
              if (playText) playText.style.display = 'none';
              if (pauseText) pauseText.style.display = 'inline';
            } else {
              player.pause();
              newBtn.querySelector('.play-icon').style.display = 'inline-block';
              newBtn.querySelector('.pause-icon').style.display = 'none';
              const playText = newBtn.querySelector('.play-text');
              const pauseText = newBtn.querySelector('.pause-text');
              if (playText) playText.style.display = 'inline';
              if (pauseText) pauseText.style.display = 'none';
            }
          });
        }
      }
    });
  });
  
  // Mute button (now inside combined container)
  document.querySelectorAll('.mute-btn').forEach(btn => {
    // Remove existing listeners to avoid duplicates
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      const videoId = newBtn.dataset.videoId;
      const controlsDiv = newBtn.closest('.video-controls');
      const videoType = controlsDiv ? controlsDiv.dataset.videoType : (newBtn.closest('.video-controls-overlay')?.dataset.videoType || 'youtube');
      
      if (videoType === 'youtube' && window.ytPlayers && window.ytPlayers[videoId]) {
        const player = window.ytPlayers[videoId];
        // Toggle mute - we'll track state manually
        const isMuted = newBtn.querySelector('.unmute-icon').style.display !== 'none';
        if (isMuted) {
          player.unMute();
          newBtn.querySelector('.mute-icon').style.display = 'inline-block';
          newBtn.querySelector('.unmute-icon').style.display = 'none';
        } else {
          player.mute();
          newBtn.querySelector('.mute-icon').style.display = 'none';
          newBtn.querySelector('.unmute-icon').style.display = 'inline-block';
        }
      } else if (videoType === 'vimeo' && window.Vimeo) {
        const player = window.vimeoPlayers && window.vimeoPlayers[videoId];
        if (player) {
          player.getVolume().then(volume => {
            if (volume === 0) {
              player.setVolume(1);
              newBtn.querySelector('.mute-icon').style.display = 'inline-block';
              newBtn.querySelector('.unmute-icon').style.display = 'none';
            } else {
              player.setVolume(0);
              newBtn.querySelector('.mute-icon').style.display = 'none';
              newBtn.querySelector('.unmute-icon').style.display = 'inline-block';
            }
          });
        }
      }
    });
  });
  
  // Turn off button (now inside combined container)
  document.querySelectorAll('.turn-off-btn').forEach(btn => {
    // Skip if already processed as part of mute button handler
    if (btn.closest('.video-controls-combined')) {
      // Remove existing listeners to avoid duplicates
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      newBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        const videoId = newBtn.dataset.videoId;
        const controlsDiv = newBtn.closest('.video-controls');
        const videoType = controlsDiv ? controlsDiv.dataset.videoType : (newBtn.closest('.video-controls-overlay')?.dataset.videoType || 'youtube');
        
        if (videoType === 'youtube' && window.ytPlayers && window.ytPlayers[videoId]) {
          const player = window.ytPlayers[videoId];
          player.pauseVideo();
        } else if (videoType === 'vimeo' && window.Vimeo) {
          const player = window.vimeoPlayers && window.vimeoPlayers[videoId];
          if (player) {
            player.pause();
          }
        }
      });
    }
  });
  
  // Progress bar - make it clickable to seek to specific time
  document.querySelectorAll('.video-progress-container').forEach(container => {
    // Remove existing listeners to avoid duplicates
    const newContainer = container.cloneNode(true);
    container.parentNode.replaceChild(newContainer, container);
    
    newContainer.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      e.stopImmediatePropagation();
      const rect = newContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, clickX / rect.width));
      const videoId = newContainer.dataset.videoId;
      const overlay = newContainer.closest('.video-controls-overlay');
      if (!overlay) return;
      const videoType = overlay.dataset.videoType || 'youtube';
      
      // Set seeking flag to prevent progress updates from interfering
      if (!window.videoSeeking) window.videoSeeking = {};
      window.videoSeeking[videoId] = true;
      
      // Store current play/pause state to preserve it during seek
      const container = overlay.closest('.video-container, .display-container');
      const controls = container ? container.nextElementSibling : null;
      const playBtn = controls?.querySelector('.play-pause-btn') || container?.querySelector('.play-pause-btn');
      let wasPlaying = false;
      if (playBtn) {
        // Check if pause icon is visible (meaning video is playing)
        wasPlaying = playBtn.querySelector('.pause-icon').style.display !== 'none';
      }
      
      // Get progress bar and time displays for smooth update
      const progressBar = overlay.querySelector('.video-progress-bar');
      const timeDisplays = overlay.querySelectorAll('.video-time');
      
      // Update UI immediately for smooth visual feedback
      const updateUI = (seekTime, duration) => {
        if (progressBar) {
          // Use requestAnimationFrame for smooth update
          requestAnimationFrame(() => {
            progressBar.style.transition = 'none'; // Disable transition during seek
            progressBar.style.width = (percent * 100) + '%';
            // Re-enable transition after a brief delay
            setTimeout(() => {
              progressBar.style.transition = 'width 0.1s linear';
            }, 50);
          });
        }
        
        if (timeDisplays.length >= 2) {
          requestAnimationFrame(() => {
            timeDisplays[0].textContent = formatTime(seekTime);
            if (duration) {
              timeDisplays[1].textContent = formatTime(duration);
            }
          });
        }
      };
      
      // Function to restore play/pause button state
      const restorePlayPauseState = () => {
        if (playBtn) {
          requestAnimationFrame(() => {
            if (wasPlaying) {
              playBtn.querySelector('.play-icon').style.display = 'none';
              playBtn.querySelector('.pause-icon').style.display = 'inline-block';
              const playText = playBtn.querySelector('.play-text');
              const pauseText = playBtn.querySelector('.pause-text');
              if (playText) playText.style.display = 'none';
              if (pauseText) pauseText.style.display = 'inline';
            } else {
              playBtn.querySelector('.play-icon').style.display = 'inline-block';
              playBtn.querySelector('.pause-icon').style.display = 'none';
              const playText = playBtn.querySelector('.play-text');
              const pauseText = playBtn.querySelector('.pause-text');
              if (playText) playText.style.display = 'inline';
              if (pauseText) pauseText.style.display = 'none';
            }
          });
        }
      };
      
      if (videoType === 'youtube' && window.ytPlayers && window.ytPlayers[videoId]) {
        const player = window.ytPlayers[videoId];
        
        // Try to get actual duration
        let duration = 0;
        if (player.getDuration && typeof player.getDuration === 'function') {
          try {
            duration = player.getDuration();
          } catch (e) {
            // Fallback to stored duration
            duration = (window.ytDurations && window.ytDurations[videoId]) || 0;
          }
        } else if (window.ytDurations && window.ytDurations[videoId]) {
          duration = window.ytDurations[videoId];
        }
        
        // If we have duration, use it; otherwise use a reasonable estimate
        if (duration && duration > 0) {
          const seekTime = duration * percent;
          
          // Update UI immediately for smooth feedback
          updateUI(seekTime, duration);
          
          // Perform seek
          player.seekTo(seekTime, true); // true = allowSeekAhead
          
          // Reset start time tracking to the seek position
          if (!window.ytStartTimes) window.ytStartTimes = {};
          window.ytStartTimes[videoId] = Date.now() - (seekTime * 1000);
          
          // Restore play/pause button state after a brief delay
          setTimeout(() => {
            restorePlayPauseState();
          }, 100);
          
          // Clear seeking flag after a short delay to allow player to catch up
          setTimeout(() => {
            window.videoSeeking[videoId] = false;
          }, 300);
        } else {
          // Fallback: try to seek with estimated duration
          const estimatedDuration = 300; // 5 minutes default
          const seekTime = estimatedDuration * percent;
          
          // Update UI immediately
          updateUI(seekTime, estimatedDuration);
          
          // Perform seek
          player.seekTo(seekTime, true);
          
          // Reset start time tracking
          if (!window.ytStartTimes) window.ytStartTimes = {};
          window.ytStartTimes[videoId] = Date.now() - (seekTime * 1000);
          
          // Restore play/pause button state after a brief delay
          setTimeout(() => {
            restorePlayPauseState();
          }, 100);
          
          // Clear seeking flag
          setTimeout(() => {
            window.videoSeeking[videoId] = false;
          }, 300);
        }
      } else if (videoType === 'vimeo' && window.Vimeo) {
        const player = window.vimeoPlayers && window.vimeoPlayers[videoId];
        if (player) {
          player.getDuration().then(duration => {
            if (duration && duration > 0) {
              const seekTime = duration * percent;
              
              // Update UI immediately
              updateUI(seekTime, duration);
              
              // Perform seek
              player.setCurrentTime(seekTime);
              
              // Restore play/pause button state after a brief delay
              setTimeout(() => {
                restorePlayPauseState();
              }, 100);
              
              // Clear seeking flag
              setTimeout(() => {
                window.videoSeeking[videoId] = false;
              }, 300);
            }
          }).catch(err => {
            console.warn('Failed to seek Vimeo video:', err);
            window.videoSeeking[videoId] = false;
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
  window.ytDurations = window.ytDurations || {}; // Store durations
  
  document.querySelectorAll('iframe[src*="youtube"]').forEach(iframe => {
    const src = iframe.src;
    const videoId = getVideoId(src, 'youtube');
    if (videoId && !window.ytPlayers[videoId]) {
      // Try to create a proper YouTube Player instance
      try {
        const player = new window.YT.Player(iframe, {
          events: {
            onReady: function(event) {
              // Get duration when player is ready
              try {
                const duration = event.target.getDuration();
                if (duration && duration > 0) {
                  window.ytDurations[videoId] = duration;
                  console.log(`YouTube video ${videoId} duration: ${duration}s`);
                }
                // Start updating progress
                updateVideoProgress(videoId, 'youtube');
              } catch (e) {
                console.warn('Could not get YouTube video duration:', e);
              }
            },
            onStateChange: function(event) {
              // Skip state change updates if currently seeking to prevent button state changes
              if (window.videoSeeking && window.videoSeeking[videoId]) {
                return;
              }
              
              // Track start time when video starts playing
              if (event.data === window.YT.PlayerState.PLAYING) {
                if (!window.ytStartTimes) window.ytStartTimes = {};
                const currentTime = event.target.getCurrentTime ? event.target.getCurrentTime() : 0;
                window.ytStartTimes[videoId] = Date.now() - (currentTime * 1000);
                
                // Ensure progress updates are running
                if (!window.videoProgressIntervals || !window.videoProgressIntervals[videoId]) {
                  updateVideoProgress(videoId, 'youtube');
                }
              }
              
              // Update play/pause button state
              const container = iframe.closest('.video-container, .display-container');
              if (container) {
                // Controls are now siblings, not children
                const controls = container.nextElementSibling;
                const playBtn = controls?.querySelector('.play-pause-btn') || container.querySelector('.play-pause-btn');
                if (playBtn) {
                  if (event.data === window.YT.PlayerState.PLAYING) {
                    playBtn.querySelector('.play-icon').style.display = 'none';
                    playBtn.querySelector('.pause-icon').style.display = 'inline-block';
                    const playText = playBtn.querySelector('.play-text');
                    const pauseText = playBtn.querySelector('.pause-text');
                    if (playText) playText.style.display = 'none';
                    if (pauseText) pauseText.style.display = 'inline';
                  } else {
                    playBtn.querySelector('.play-icon').style.display = 'inline-block';
                    playBtn.querySelector('.pause-icon').style.display = 'none';
                    const playText = playBtn.querySelector('.play-text');
                    const pauseText = playBtn.querySelector('.pause-text');
                    if (playText) playText.style.display = 'inline';
                    if (pauseText) pauseText.style.display = 'none';
                  }
                }
              }
            }
          }
        });
        window.ytPlayers[videoId] = player;
        console.log(`Initialized YouTube Player for ${videoId}`);
      } catch (e) {
        console.warn('Failed to create YouTube Player, using postMessage fallback:', e);
        // Fallback to postMessage API
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
          getDuration: function() { return window.ytDurations[videoId] || 0; },
          getPlayerState: function() { return -1; },
          isMuted: function() { return false; }
        };
      }
    }
  });
}

// Fallback postMessage initialization
function initYouTubePlayersPostMessage() {
  window.ytPlayers = window.ytPlayers || {};
  window.ytDurations = window.ytDurations || {}; // Store durations
  
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
        getDuration: function() { return window.ytDurations[videoId] || 0; },
        getPlayerState: function() { return -1; },
        isMuted: function() { return false; }
      };
      
      // Try to get duration via YouTube Data API or estimate
      // For now, we'll try to get it from the iframe after it loads
      iframe.addEventListener('load', () => {
        // Try to request duration via postMessage (limited support)
        // Most reliable: use YouTube Data API or wait for YT.Player
        // For now, we'll use a reasonable default and update when available
        if (!window.ytDurations[videoId]) {
          // Try to get from YouTube Data API if available
          // Otherwise, we'll estimate or wait for YT.Player to load
          window.ytDurations[videoId] = null; // Will be set when available
        }
      });
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
        
        // Check if autoplay is enabled in the URL
        const urlParams = new URL(src).searchParams;
        const autoplay = urlParams.get('autoplay') === '1' || urlParams.get('autoplay') === 'true';
        const muted = urlParams.get('muted') === '1' || urlParams.get('muted') === 'true';
        
        player.on('play', () => {
          // Skip state change updates if currently seeking
          if (window.videoSeeking && window.videoSeeking[videoId]) {
            return;
          }
          
          // Ensure progress updates are running
          if (!window.videoProgressIntervals || !window.videoProgressIntervals[videoId]) {
            updateVideoProgress(videoId, 'vimeo');
          }
          
          const container = iframe.closest('.video-container, .display-container');
          if (container) {
            // Controls are now siblings, not children
            const controls = container.nextElementSibling;
            const playBtn = controls?.querySelector('.play-pause-btn') || container.querySelector('.play-pause-btn');
            if (playBtn) {
              playBtn.querySelector('.play-icon').style.display = 'none';
              playBtn.querySelector('.pause-icon').style.display = 'inline-block';
              const playText = playBtn.querySelector('.play-text');
              const pauseText = playBtn.querySelector('.pause-text');
              if (playText) playText.style.display = 'none';
              if (pauseText) pauseText.style.display = 'inline';
            }
          }
        });
        
        player.on('pause', () => {
          // Skip state change updates if currently seeking
          if (window.videoSeeking && window.videoSeeking[videoId]) {
            return;
          }
          
          const container = iframe.closest('.video-container, .display-container');
          if (container) {
            // Controls are now siblings, not children
            const controls = container.nextElementSibling;
            const playBtn = controls?.querySelector('.play-pause-btn') || container.querySelector('.play-pause-btn');
            if (playBtn) {
              playBtn.querySelector('.play-icon').style.display = 'inline-block';
              playBtn.querySelector('.pause-icon').style.display = 'none';
              const playText = playBtn.querySelector('.play-text');
              const pauseText = playBtn.querySelector('.pause-text');
              if (playText) playText.style.display = 'inline';
              if (pauseText) pauseText.style.display = 'none';
            }
          }
        });
        
        // Try to autoplay if enabled in URL
        if (autoplay) {
          // Wait for player to be ready, then try to play
          player.ready().then(() => {
            // Set volume to 0 if muted, otherwise keep default
            if (muted) {
              player.setVolume(0).catch(() => {
                // Volume setting might fail, that's okay
              });
            }
            // Try to play the video
            player.play().catch(error => {
              // Autoplay might be blocked by browser policy
              console.log(`Vimeo autoplay blocked for video ${videoId}:`, error);
            });
          }).catch(error => {
            console.warn('Vimeo player not ready:', error);
          });
        }
        
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
  const timeDisplays = overlay.querySelectorAll('.video-time');
  if (!progressBar || timeDisplays.length < 2) return;
  
  // Initialize start time tracking for YouTube fallback
  if (!window.ytStartTimes) window.ytStartTimes = {};
  if (!window.ytStartTimes[videoId]) {
    window.ytStartTimes[videoId] = null;
  }
  
  const update = () => {
    // Skip update if currently seeking to prevent glitches
    if (window.videoSeeking && window.videoSeeking[videoId]) {
      return;
    }
    
    if (videoType === 'youtube' && window.ytPlayers && window.ytPlayers[videoId]) {
      const player = window.ytPlayers[videoId];
      
      // Try to get current time and duration if available
      let currentTime = 0;
      let duration = 0;
      let hasValidTime = false;
      
      // Try to get current time from player
      if (player.getCurrentTime && typeof player.getCurrentTime === 'function') {
        try {
          const time = player.getCurrentTime();
          if (time && !isNaN(time) && time >= 0) {
            currentTime = time;
            hasValidTime = true;
            // Reset start time tracking when we get valid time
            if (window.ytStartTimes[videoId] === null) {
              window.ytStartTimes[videoId] = Date.now() - (currentTime * 1000);
            }
          }
        } catch (e) {
          // Can't get current time from API
        }
      }
      
      // Fallback: estimate time based on when video started
      if (!hasValidTime && window.ytStartTimes[videoId] !== null) {
        const elapsed = (Date.now() - window.ytStartTimes[videoId]) / 1000;
        currentTime = Math.max(0, elapsed);
        hasValidTime = true;
      }
      
      // Get duration
      if (player.getDuration && typeof player.getDuration === 'function') {
        try {
          duration = player.getDuration();
          // Store duration for seeking
          if (duration && duration > 0) {
            if (!window.ytDurations) window.ytDurations = {};
            window.ytDurations[videoId] = duration;
          }
        } catch (e) {
          // Try stored duration
          if (window.ytDurations && window.ytDurations[videoId]) {
            duration = window.ytDurations[videoId];
          }
        }
      } else if (window.ytDurations && window.ytDurations[videoId]) {
        duration = window.ytDurations[videoId];
      }
      
      // Update progress bar and time displays
      if (duration && duration > 0) {
        // Clamp current time to duration
        currentTime = Math.min(currentTime, duration);
        const percent = (currentTime / duration) * 100;
        
        // Use requestAnimationFrame for smooth updates
        requestAnimationFrame(() => {
          // Double-check we're not seeking
          if (window.videoSeeking && window.videoSeeking[videoId]) {
            return;
          }
          progressBar.style.width = Math.max(0, Math.min(100, percent)) + '%';
          timeDisplays[0].textContent = formatTime(currentTime);
          timeDisplays[1].textContent = formatTime(duration);
        });
      } else {
        // Show placeholder if duration not available yet
        if (progressBar.style.width === '0%' || !progressBar.style.width) {
          timeDisplays[0].textContent = '00:00';
          timeDisplays[1].textContent = '00:00';
        }
      }
    } else if (videoType === 'vimeo' && window.vimeoPlayers && window.vimeoPlayers[videoId]) {
      const player = window.vimeoPlayers[videoId];
      Promise.all([player.getCurrentTime(), player.getDuration()]).then(([current, duration]) => {
        // Skip update if currently seeking
        if (window.videoSeeking && window.videoSeeking[videoId]) {
          return;
        }
        
        if (duration && !isNaN(current) && !isNaN(duration) && current >= 0) {
          const percent = (current / duration) * 100;
          
          // Use requestAnimationFrame for smooth updates
          requestAnimationFrame(() => {
            // Double-check we're not seeking
            if (window.videoSeeking && window.videoSeeking[videoId]) {
              return;
            }
            progressBar.style.width = Math.max(0, Math.min(100, percent)) + '%';
            if (timeDisplays.length >= 2) {
              timeDisplays[0].textContent = formatTime(current);
              timeDisplays[1].textContent = formatTime(duration);
            } else if (timeDisplays.length === 1) {
              // Fallback: show combined format if only one time display
              timeDisplays[0].textContent = formatTime(current) + ' / ' + formatTime(duration);
            }
          });
        }
      }).catch(() => {
        // Player not ready
      });
    }
  };
  
  // Don't start interval if one already exists for this video
  if (!window.videoProgressIntervals) window.videoProgressIntervals = {};
  if (window.videoProgressIntervals[videoId]) {
    // Already updating, just return
    return;
  }
  
  // Initial update
  update();
  
  // Start continuous updates every 100ms
  const interval = setInterval(() => {
    // Check if overlay still exists
    const overlay = document.querySelector(`.video-controls-overlay[data-video-id="${videoId}"]`);
    if (!overlay) {
      // Clean up if overlay is removed
      clearInterval(interval);
      delete window.videoProgressIntervals[videoId];
      return;
    }
    update();
  }, 100);
  
  // Store interval to clear later if needed
  window.videoProgressIntervals[videoId] = interval;
}

// Format time in MM:SS format (00:00 style)
function formatTime(seconds) {
  if (isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
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
        <button class="display-nav prev" data-display-id="${displayId}" style="display: none;">&lt;</button>
        <button class="display-nav next" data-display-id="${displayId}" style="display: none;">&gt;</button>
      </div>
      <div class="gallery-counter" data-display-id="${displayId}">1/${videos.length}</div>
    </div>
  `;
}


