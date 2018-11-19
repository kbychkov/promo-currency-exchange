const dom = require('../utils/DOM');
const Utils = require('../utils/Utils');
// const DetectSizeVersionHelper = require('../helpers/DetectSizeVersionHelper');
const Callback = require('../classes/Callback');

const FIXED_STATE_CLASS = '_fixed';
const COLLAPSED_STATE_CLASS = '_collapsed';
const AWAY_STATE_CLASS = '_away';
const DOWN = 'down';
const UP = 'up';
const CURRENT = 'current';

function Header() {
	this.$header = dom.$body.find('.header');
	this.$wrapper = this.$header.parent();
	this.headerHeight = 0;
	this.currentY = dom.$window.scrollTop();
	this.lastY = this.currentY;
	this.activeState = true;

	// DetectSizeVersionHelper.onChange.add(() => this._versionsController());

	// Binds
	let f = () => this._scrollController();
	let d = () => this._directionController();
	let r = Utils.debounce(() => this._resizeController());
	this._addListeners = () => {
		if (this.listenersAdded) {
			return;
		}
		this.listenersAdded = true;

		this.setFixedState();
		dom.$window.on('scroll', f);
		dom.$window.on('scroll', d);
		dom.$window.on('resize', r);
		f();
	};

	this._removeListeners = () => {
		if (!this.listenersAdded) {
			return;
		}
		this.listenersAdded = false;

		dom.$window.off('scroll', f);
		dom.$window.off('scroll', d);
		dom.$window.off('resize', r);
		this.unsetFixedState();
		this.unsetCollapsedState();
	};

	// TODO: Отрефакторить.
	this._addListeners();

	this.onScrollDirectionChange = new Callback();
	this.onScrollDirectionChange.add(direction => this._directionChangeController(direction));
}

Header.prototype = {
	_versionsController() {
		// TODO: Изначально, шапка-прилипалка была только для десктопа. Потом обсудили, и решили
		// сделать для всех устройст. Поэтому, по сути, сейчас этот контроллер не нужен вовсе.
		// На всякий случай, оставляю. Перед сдачей можно будет отрефакторить тут слегка.
		// let isDesktop = DetectSizeVersionHelper.isCurrentVersion(DetectSizeVersionHelper.DESKTOP);
		// if (isDesktop) {
		// 	this._addListeners();
		// } else {
		// 	this._removeListeners();
		// }
		this._addListeners();
	},
	_scrollController() {
		if (!this.activeState) {
			return;
		}

		let y = dom.$window.scrollTop();
		y = Math.max(0, y);
		this.currentY = y;

		if (y > this.headerHeight) {
			this.setCollapsedState();
		} else {
			this.unsetCollapsedState();
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
		this.headerHeight = Math.round(this.$header.outerHeight() + (parseInt(this.$header.css('margin-bottom'), 10) || 0));
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
	setCollapsedState() {
		this.$header.addClass(COLLAPSED_STATE_CLASS);
	},
	unsetCollapsedState() {
		this.$header.removeClass(COLLAPSED_STATE_CLASS);
	},
	setAwayState() {
		this.$header.addClass(AWAY_STATE_CLASS);
	},
	unsetAwayState() {
		this.$header.removeClass(AWAY_STATE_CLASS);
	},

	setModuleActiveState(state) {
		state = !!state;
		this.activeState = state;
		let scrollTop = dom.$window.scrollTop();
		if (state === true && scrollTop === 0) {
			this.unsetAwayState();
			this.unsetCollapsedState();
		}
	},
};

module.exports = new Header();
