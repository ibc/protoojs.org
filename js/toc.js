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

}, false);
