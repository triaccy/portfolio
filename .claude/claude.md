## UI Conventions

### Video
- All videos must have the same overlay style applied consistently across every page. The overlay appears on hover.

### Gallery / Image Flip-through
- Clicking activates flip-through navigation (not hover or drag).
- The cursor must change to a left-right resize cursor (`cursor: ew-resize`) when hovering over a flippable gallery, to signal interactivity.
- A page counter is displayed at the bottom of each gallery (e.g. `1 / 5`), wrapping back to 1 after the last item.
- Counter color: medium gray.
- This behavior applies to every page that contains a gallery.

### Navigation
- Every page must have a `←  Back` button in the same fixed position across all pages.

### Media Containment & Sizing
- All media (video and image) must have consistent 80px padding from the viewport edges on all sides.
- Media must fill the available padded area as large as possible while preserving its original aspect ratio — never crop, never stretch.
- Single media and gallery slides: constrained by both `max-width: calc(100vw - 160px)` and `max-height: calc(100vh - 160px)`. The container's `aspect-ratio` is set dynamically per slide to match the media's natural dimensions.
- Stacked videos: full padded width (`calc(100vw - 160px)`), height determined by each video's natural aspect ratio, scrollable.

### Layout & Alignment
- All images and videos share a single consistent center point across all pages.
- Do not reposition media per page — align to the global center.
