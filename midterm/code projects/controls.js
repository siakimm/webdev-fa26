// Pause drawing in a hidden tab; resume automatically when the visitor returns.
// Microphone access is stopped when leaving and is never restarted automatically.
function stopHiddenSketch() {
  if (typeof noLoop === 'function') noLoop();
  if (typeof stopMicrophone === 'function') stopMicrophone();
  document.getElementById('sketch-status').textContent = '';
}
window.addEventListener('pagehide', stopHiddenSketch);
window.addEventListener('pageshow', function () { if (typeof loop === 'function') loop(); });
document.addEventListener('visibilitychange', function () {
  if (document.hidden) stopHiddenSketch();
  else if (typeof loop === 'function') loop();
});
window.addEventListener('load', function () {
  const canvas = document.querySelector('canvas');
  if (!canvas) { document.getElementById('sketch-status').textContent = 'The sketch could not start. Try a browser with graphics support enabled.'; return; }
  canvas.setAttribute('aria-label', document.title);
  canvas.setAttribute('tabindex', '0');
  canvas.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && typeof spawnRipple === 'function') spawnRipple(width / 2, height / 2);
  });
});
