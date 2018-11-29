var dom = require('../utils/DOM');
var env = require('../utils/ENV');

function BodyLocker() {
	this.$widthTestElements = dom.$html.add(dom.$body);

	this.$wrapper = $('.wrapper').add($('.anchor-menu'));

	this.$widthTestElements.css({
		overflow: 'visible',
	});
	var realWidth = dom.$html.width();

	this.$widthTestElements.css({
		overflow: 'hidden',
	});
	var hiddenWidth = dom.$html.width();

	this.$widthTestElements.css({
		overflow: '',
	});

	this.scrollWidth = hiddenWidth - realWidth;

	this.fixedPageElems = $('[data-fixed-element]');
}

BodyLocker.prototype = {
	lock: function() {
		if (env.isMobile) {
			return;
		}

		if (!this.locked) {
			this.locked = true;

			this.$wrapper.css({
				paddingRight: this.scrollWidth,
			});

			this.fixedPageElems.css('padding-right', this.scrollWidth + 'px');
		}
	},
	unlock: function() {
		if (env.isMobile) {
			return;
		}

		if (this.locked) {
			this.locked = false;

			this.$wrapper.css({
				paddingRight: '',
			});

			this.fixedPageElems.css('padding-right', '');
		}
	},
};

var instance = (module.exports = new BodyLocker());
instance.version = 1;
