window.addEventListener('load', function() {

	var tocButton = document.querySelector('.toc-button'),
		toc = document.querySelector('.toc-wrapper');

	// Click on the TOC button shows/hides the TOC panel.
	tocButton.addEventListener('click', function(event) {
		if (! toc.classList.contains('visible')) {
			toc.classList.add('visible');
		}
		else {
			toc.classList.remove('visible');
		}
	}, false);

	// ESC key hides the TOC panel.
	window.addEventListener('keydown', function(event) {
		// ESC
		if (event.keyCode === 27) {
			toc.classList.remove('visible');
		}
	}, false);

	// Click on the whole page hides the TOC panel,
	document.body.addEventListener('click', function(event) {
		toc.classList.remove('visible');
	}, false);
	// ...unless it is the TOC button,
	tocButton.addEventListener('click', function(event) {
		event.stopPropagation();
	}, false);
	// ...or the TOC panel.
	toc.addEventListener('click', function(event) {
		event.stopPropagation();
	}, false);

	// Hack 1 to avoid content (body) scrolling while scrolling the TOC.
	toc.addEventListener('mouseover', function(event) {
		// NOTE: This does not work in Chrome but does work in Firefox and Safari.
		document.body.style.overflow = 'hidden';
	}, false);
	toc.addEventListener('mouseout', function(event) {
		document.body.style.overflow = 'auto';
	}, false);

	// Hack 2 to avoid content (body) scrolling while scrolling the TOC.
	toc.addEventListener('mousewheel', function(event) {
		// This works in Chrome but just if the TOC needs a vertical scroll.
		return false;
	}, false);

}, false);
