var dom = require('../utils/DOM');

var OPENED = '_opened';
var ACTIVE = '_active';

function Switchers() {
	var self = this;
	dom.$body.on('click', '[data-switcher-tab-opener]', function(e) {
		e.preventDefault();
		self._manageOpenerClick($(this));
	});
}
Switchers.prototype = {
	_manageOpenerClick: function($opener) {
		var $owner = $opener.parents('[data-switcher]').first();
		if (!$owner.length) {
			return;
		}

		var mode = $owner.attr('data-switcher-mode');
		mode = typeof mode == 'undefined' ? 'slide' : mode.toLowerCase();
		mode == (mode != 'slide' && mode != 'fade' && mode != 'acc') ? 'slide' : mode;

		var openerIsActive = $opener.hasClass(ACTIVE);

		var $allTabs = $owner.find('[data-switcher-tab]');
		var $openTab = $allTabs.filter('[data-switcher-tab="' + $opener.attr('data-switcher-tab-opener') + '"]');
		var $closeTabs = $allTabs.not($openTab);

		var $allOpeners = $owner.find('[data-switcher-tab-opener]');
		var $otherOpeners = $allOpeners.not($opener);

		if (mode == 'fade') {
			if (!openerIsActive) {
				$closeTabs
					.stop()
					.hide()
					.removeClass(OPENED);
				$openTab
					.stop()
					.fadeIn()
					.addClass(OPENED);

				$opener.addClass(ACTIVE);
				$otherOpeners.removeClass(ACTIVE);
			}
		} else if (mode == 'slide') {
			if (openerIsActive) {
				$openTab
					.stop()
					.slideUp()
					.removeClass(OPENED);
				$opener.removeClass(ACTIVE);
			} else {
				$openTab
					.stop()
					.slideDown()
					.addClass(OPENED);
				$opener.addClass(ACTIVE);
			}
		} else if (mode == 'acc') {
			if (openerIsActive) {
				$allTabs
					.stop()
					.slideUp()
					.removeClass(OPENED);
				$allOpeners.removeClass(ACTIVE);
			} else {
				$closeTabs
					.stop()
					.slideUp()
					.removeClass(OPENED);
				$allOpeners.removeClass(ACTIVE);

				$openTab
					.stop()
					.slideDown()
					.addClass(OPENED);
				$opener.addClass(ACTIVE);
			}
		}
	},
};

var instance = (module.exports = new Switchers());
instance.version = 1;