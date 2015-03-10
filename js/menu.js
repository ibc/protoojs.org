window.addEventListener('load', function() {

	var topBar = document.querySelector('.top-bar');

	document.addEventListener('click', function() {
		topBar.classList.remove('visible');
	}, false);

	topBar.querySelector('.menu-icon').addEventListener('click', function(event) {
		if (! topBar.classList.contains('visible')) {
			topBar.classList.add('visible');
			event.stopPropagation();
		} else {
			topBar.classList.remove('visible');
		}
	}, false);

}, false);
