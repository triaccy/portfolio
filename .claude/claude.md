## UI Conventions

### Video
- All videos must have the same overlay style applied consistently across every page. The overlay appears on hover.
- when doing overlay, first assess the dimension/ratio of the video then apply the overlay where its visiable and all overlay should have a constant distance form the bottom of the video. 
- the color of overlay should be determined by the underlying video background, if its white, then the overlay should be dark gray, if not white, then white 

### Gallery / Image Flip-through
- Clicking activates flip-through navigation (not hover or drag).
- The cursor must change to a left-right resize cursor (`cursor: ew-resize`) when hovering over a flippable gallery in area that is active to flip (for example the 5px on the left and right of videos and the whole image) to signal interactivity.
- A page counter is displayed at the bottom of each gallery (e.g. `1 / 5`), wrapping back to 1 after the last item. the current number should be one a dark grey. 
- Counter color: medium gray.
- This behavior applies to every page that contains a gallery.
- Videos in flipthrough should always have the 5px section on the left and irght end of the 4
- click left or right on the keepboard to advance and go back and content should always be wrapped. 

### Navigation
- Every page must have a `←  Back` button in the same fixed position across all pages.

### Layout & Alignment
- All images and videos share a single consistent center point across all pages.
- Do not reposition media per page — align to the global center.
