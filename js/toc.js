window.addEventListener('load', function() {

	var tocButton = document.querySelector('.toc-button'),
		toc = document.querySelector('.toc-wrapper');

	tocButton.addEventListener('click', function(event) {
		if (! toc.classList.contains('visible')) {
			toc.classList.add('visible');
		}
		else {
			toc.classList.remove('visible');
		}
	}, false);

	window.addEventListener('keydown', function(event) {
		// ESC
		if (event.keyCode === 27) {
			toc.classList.remove('visible');
		}
	}, false);

	toc.addEventListener('mouseover', function(event) {
		// NOTE: This does not work in Chrome.
		document.body.style.overflow = 'hidden';
	}, false);

	toc.addEventListener('mouseout', function(event) {
		document.body.style.overflow = 'auto';
	}, false);

}, false);
