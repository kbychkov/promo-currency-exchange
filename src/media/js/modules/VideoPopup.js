const Popups = require('./Popups');

function VideoPopup() {
	let $videoPopup = $('[data-popup="video"]');

	Popups.onOpen.add(name => {
		if (name !== 'video') {
			return;
		}

		let $iframe = $videoPopup.find('iframe');
		$iframe.attr('src', $iframe.attr('data-src'));
		$iframe.removeAttr('data-src');
	});

	Popups.onClose.add(name => {
		if (name !== 'video') {
			return;
		}

		let $iframe = $videoPopup.find('iframe');
		$iframe.attr('data-src', $iframe.attr('src'));
		$iframe.removeAttr('src');
	});
}

VideoPopup.prototype = {};

module.exports = new VideoPopup();
