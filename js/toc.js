window.addEventListener('load', function() {

	$('.content').scrollNav({
		sections: 'h2, h3, h4',
		subSections: true,
		sectionElem: 'div',
		showHeadline: false,
		showTopLink: false,
		scrollToHash: false,
		scrollOffset: $('.top-bar').outerHeight()
	});

}, false);
