function VideoPopup() {
	let $videoPopup = $('#video');
	$videoPopup.on('popups:open', () => {
		let $iframe = $videoPopup.find('iframe');
		$iframe.attr('src', $iframe.attr('data-src'));
		$iframe.removeAttr('data-src');
	});
	$videoPopup.on('popups:close', () => {
		let $iframe = $videoPopup.find('iframe');
		$iframe.attr('data-src', $iframe.attr('src'));
		$iframe.removeAttr('src');
	});
}

VideoPopup.prototype = {};

module.exports = new VideoPopup();
