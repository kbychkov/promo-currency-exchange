const dom = require('../utils/DOM');
const Utils = require('../utils/Utils');
const Callback = require('../classes/Callback');

const FIXED_STATE_CLASS = '_fixed';
const STATE_2_CLASS = '_state2';
const AWAY_STATE_CLASS = '_away';
const DOWN = 'down';
const UP = 'up';
const CURRENT = 'current';
const SET_AWAY_STATE = false;
const SET_PADDINGS = !dom.$html.hasClass('_header-fixed');

function Header() {
	this.$header = dom.$body.find('.header');
	this.$wrapper = this.$header.parent();
	this.headerHeight = 0;
	this.currentY = dom.$window.scrollTop();
	this.lastY = this.currentY;
	this.activeState = true;

	this.setFixedState();
	dom.$window.on('scroll', () => this._scrollController());
	dom.$window.on('scroll', () => this._directionController());
	dom.$window.on('resize', Utils.debounce(() => this._resizeController()));
	this._scrollController();

	this.onScrollDirectionChange = new Callback();
	this.onScrollDirectionChange.add(direction => this._directionChangeController(direction));
}

Header.prototype = {
	_scrollController() {
		if (!this.activeState) {
			return;
		}

		let y = dom.$window.scrollTop();
		y = Math.max(0, y);
		this.currentY = y;

		if (y > this.headerHeight) {
			this.setState2();
		} else {
			this.unsetState2();
		}
	},
	_directionController() {
		if (!this.activeState) {
			return;
		}

		let direction;
		if (this.currentY > this.lastY) {
			direction = DOWN;
		} else if (this.currentY < this.lastY) {
			direction = UP;
		} else {
			direction = CURRENT;
		}
		this.lastY = this.currentY;
		if (this.currentScrollDirection === direction) {
			return;
		}

		this.currentScrollDirection = direction;
		this.onScrollDirectionChange.call(direction);
	},
	_directionChangeController(direction) {
		if (direction === DOWN) {
			this.setAwayState();
		} else if (direction === UP) {
			this.unsetAwayState();
		}
	},
	_resizeController() {
		this._updatePaddings();
	},
	_updatePaddings() {
		if (!SET_PADDINGS) {
			return;
		}
		this.headerHeight = Math.round(
			this.$header.outerHeight() + (parseInt(this.$header.css('margin-bottom'), 10) || 0)
		);
		this.$wrapper.css('padding-top', `${this.headerHeight}px`);
	},

	setFixedState() {
		this._updatePaddings();
		this.$header.addClass(FIXED_STATE_CLASS);
	},
	unsetFixedState() {
		this.$header.removeClass(FIXED_STATE_CLASS);
		this.$wrapper.css('padding-top', '');
	},
	setState2() {
		this.$header.addClass(STATE_2_CLASS);
	},
	unsetState2() {
		this.$header.removeClass(STATE_2_CLASS);
	},
	setAwayState() {
		if (!SET_AWAY_STATE) {
			return;
		}
		this.$header.addClass(AWAY_STATE_CLASS);
	},
	unsetAwayState() {
		if (!SET_AWAY_STATE) {
			return;
		}
		this.$header.removeClass(AWAY_STATE_CLASS);
	},

	setModuleActiveState(state) {
		state = !!state;
		this.activeState = state;
		let scrollTop = dom.$window.scrollTop();
		if (state === true && scrollTop === 0) {
			this.unsetAwayState();
			this.unsetState2();
		}
	},
};

module.exports = new Header();
