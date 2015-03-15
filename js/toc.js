window.addEventListener('load', function() {

	var tocButton = document.querySelector('.toc-button'),
		toc = document.querySelector('.toc-wrapper'),
		tocUl = document.querySelector('.toc-wrapper ul.toc'),
		transitionDuration = 200;

	function showToc() {
		if (toc.classList.contains('visible')) { return; }

		toc.classList.add('visible');
		tocUl.style.display = '';
	}

	function hideToc() {
		if (! toc.classList.contains('visible')) { return; }

		toc.classList.remove('visible');
		setTimeout(function() {
			if (! toc.classList.contains('visible')) {
				tocUl.style.display = 'none';
			}
		}, transitionDuration * 1.5);
	}

	// Click on the TOC button shows/hides the TOC panel.
	tocButton.addEventListener('click', function(event) {
		if (! toc.classList.contains('visible')) {
			showToc();
		}
		else {
			hideToc();
		}
	}, false);

	// ESC key hides the TOC panel.
	window.addEventListener('keydown', function(event) {
		// ESC
		if (event.keyCode === 27) {
			hideToc();
		}
	}, false);

	// Click on the whole page hides the TOC panel,
	document.body.addEventListener('click', function(event) {
		hideToc();
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
