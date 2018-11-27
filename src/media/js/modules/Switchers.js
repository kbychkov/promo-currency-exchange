var dom = require('../utils/DOM');

var OPENED = '_opened';
var ACTIVE = '_active';

// NOTE: Модуль взят из набора компонентов SP,
// и доработан лишь слегка.
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
		} else if (mode == 'hide') {
			if (openerIsActive) {
				$allTabs.hide().removeClass(OPENED);
				$allOpeners.removeClass(ACTIVE);
			} else {
				$closeTabs.hide().removeClass(OPENED);
				$allOpeners.removeClass(ACTIVE);

				$openTab.show().addClass(OPENED);
				$opener.addClass(ACTIVE);
			}
		} else if (mode == 'away-x') {
			if (openerIsActive) {
				TweenMax.killTweensOf($allTabs);
				TweenMax.to($allTabs, 0.4, {
					x: '-100%',
					autoAlpha: 0,
				});
				$allOpeners.removeClass(ACTIVE);
			} else {
				TweenMax.killTweensOf($closeTabs);
				TweenMax.to($closeTabs, 0.4, {
					x: '-100%',
					autoAlpha: 0,
					onComplete: () => {
						$closeTabs.hide();

						TweenMax.killTweensOf($openTab);
						TweenMax.fromTo(
							$openTab.show(),
							0.4,
							{
								x: '100%',
								autoAlpha: 0,
							},
							{
								x: '0%',
								autoAlpha: 1,
							}
						);
					},
				});
				$allOpeners.removeClass(ACTIVE);
				$opener.addClass(ACTIVE);
			}
		} else if (mode == 'away-y') {
			if (openerIsActive) {
				TweenMax.killTweensOf($allTabs);
				TweenMax.to($allTabs, 0.4, {
					y: '20px',
					autoAlpha: 0.25,
				});
				$allOpeners.removeClass(ACTIVE);
			} else {
				TweenMax.killTweensOf($closeTabs);
				TweenMax.to($closeTabs, 0.4, {
					y: '20px',
					autoAlpha: 0.25,
					onComplete: () => {
						$closeTabs.hide();

						TweenMax.killTweensOf($openTab);
						TweenMax.fromTo(
							$openTab.show(),
							0.4,
							{
								y: '20px',
								autoAlpha: 0.25,
							},
							{
								y: '0px',
								autoAlpha: 1,
							}
						);
					},
				});
				$allOpeners.removeClass(ACTIVE);
				$opener.addClass(ACTIVE);
			}
		} else if (mode == 'fade--soft') {
			if (openerIsActive) {
				TweenMax.killTweensOf($allTabs);
				TweenMax.to($allTabs, 0.25, {
					autoAlpha: 0.75,
				});
				$allOpeners.removeClass(ACTIVE);
			} else {
				TweenMax.killTweensOf($closeTabs);
				TweenMax.to($closeTabs, 0.25, {
					autoAlpha: 0.75,
					onComplete: () => {
						$closeTabs.hide();

						TweenMax.killTweensOf($openTab);
						TweenMax.fromTo(
							$openTab.show(),
							0.25,
							{
								autoAlpha: 0.75,
							},
							{
								autoAlpha: 1,
							}
						);
					},
				});
				$allOpeners.removeClass(ACTIVE);
				$opener.addClass(ACTIVE);
			}
		}
	},
};

var instance = (module.exports = new Switchers());
instance.version = 1;
