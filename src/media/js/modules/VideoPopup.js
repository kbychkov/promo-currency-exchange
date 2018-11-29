function VideoPopup() {
	let $videoPopup = $('#video');
	$videoPopup.on('popups:open', () => {
		setTimeout(() => {
			let $iframe = $videoPopup.find('iframe');
			$iframe.attr('src', $iframe.attr('data-src'));
			$iframe.removeAttr('data-src');
		}, 500);
	});
	$videoPopup.on('popups:close', () => {
		setTimeout(() => {
			let $iframe = $videoPopup.find('iframe');
			$iframe.attr('data-src', $iframe.attr('src'));
			$iframe.removeAttr('src');
		}, 500);
	});
}

VideoPopup.prototype = {};

module.exports = new VideoPopup();
