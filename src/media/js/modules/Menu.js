const dom = require('../utils/DOM');
const env = require('../utils/ENV');
const Header = require('./Header');

const OPENED_CLASS = '_menu-opened';
const SwipeCatchHelper = require('../helpers/SwipeCatchHelper');

function Menu() {
	this.$container = dom.$body.find('.header__menu-block');
	this.$wrapper = $('.wrapper');
	this.opened = false;
	this.savedScrollTop = 0;
	if (this.opened) {
		dom.$html.addClass(OPENED_CLASS);
	}

	// Binds
	dom.$body.find('[data-menu-opener]').on('click', () => this.open());
	dom.$body.find('[data-menu-closer]').on('click', () => this.close());
	dom.$body.find('[data-menu-toggler]').on('click', () => this.toggle());

	this.scrollBarWidth = 0;
	this.testedScrollbarWidth = false;
	this.animating = false;

	let appliedState = -1;

	this.$menuItems = this.$container.find('.main-menu__item');

	dom.$window
		.on('keyup', e => {
			if (this.opened && e.keyCode == 27) {
				this.close();
			}
		})
		.on('resize', e => {
			let newState = window.innerWidth >= 1000 ? 1 : 0;
			if (appliedState != newState) {
				appliedState = newState;

				if (window.innerWidth >= 1000) {
					if (this.opened) {
						this.close(true);
					}
					TweenMax.set(this.$container, { x: '0%' });
				} else {
					if (!this.opened) {
						TweenMax.set(this.$container, { x: '100%' });
					}
				}
			}
		});

	SwipeCatchHelper.watch(
		dom.$body,
		direction => {
			if (this.opened && direction == SwipeCatchHelper.RIGHT) {
				this.close();
			}
		},
		null,
		null,
		true
	);
}

Menu.prototype = {
	open() {
		if (this.opened || this.animating) {
			return;
		}
		this.opened = true;

		let scrTop = dom.$window.scrollTop();
		// this.$container.removeClass(AWAY_CLASS);
		Header.setModuleActiveState(false);
		this.savedScrollTop = scrTop;

		//let wrapperY = this.$wrapper[0].getBoundingClientRect().top

		if (!this.testedScrollbarWidth && env.isDesktop) {
			this.testedScrollbarWidth = true;
			let bodyWidth = dom.$body.width();

			dom.$html.addClass(OPENED_CLASS);
			let noOverflowWidth = dom.$body.width();
			this.scrollBarWidth = noOverflowWidth - bodyWidth;

			this.$wrapper.css({
				'padding-right': this.scrollBarWidth + 'px',
			});

			// console.log(this.scrollBarWidth)
		} else {
			dom.$html.addClass(OPENED_CLASS);

			if (env.isDesktop) {
				this.$wrapper.css({
					'padding-right': this.scrollBarWidth + 'px',
				});
			}
		}

		dom.$wrapper.scrollTop(scrTop);

		let newWrapperY = this.$wrapper[0].getBoundingClientRect().top;
		//alert(wrapperY + ' / ' + newWrapperY + ' / ' + scrTop)
		dom.$wrapper.scrollTop(scrTop + newWrapperY);

		this.$container.find('.header__menu-container').scrollTop(0);
		TweenMax.fromTo(
			this.$container /*.nope(false)*/,
			0.65,
			{ x: '100%' },
			{
				x: '0%',
				ease: Circ.easeInOut,
				onComplete: () => {
					this.animating = false;

					// NOTE: Баг с проматыванием основного контента
					// на айфонах при открытом меню.
					if (env.isIOS) {
						setTimeout(() => {
							dom.$body.add(dom.$html).css({
								overflow: 'hidden',
								height: '100%',
								'min-height': '0',
							});
							this.$wrapper.scrollTop(this.savedScrollTop);
						}, 200);
					}
				},
			}
		);

		TweenMax.staggerFromTo(
			this.$menuItems,
			0.75,
			{ x: 20, alpha: 0 },
			{ x: 0, alpha: 1, delay: 0.5, ease: Back.easeOut },
			0.075
		);
	},
	close(immediate) {
		if (!this.opened || (this.animating && !immediate)) {
			return;
		}
		this.opened = false;

		// this.$container.addClass(AWAY_CLASS);
		dom.$html.removeClass(OPENED_CLASS).scrollTop(this.savedScrollTop);
		Header.setModuleActiveState(true);

		if (env.isDesktop) {
			this.$wrapper.css({
				'padding-right': '',
			});
		}
		this.animating = true;
		TweenMax.to(this.$container /*.nope()*/, immediate ? 0 : 0.5, {
			x: '100%',
			onComplete: () => {
				this.animating = false;
			},
		});

		// NOTE: Баг с проматыванием основного контента
		// на айфонах при открытом меню.
		if (env.isIOS) {
			dom.$body.add(dom.$html).css({
				overflow: '',
				height: '',
				'min-height': '',
			});
			dom.$body.scrollTop(this.savedScrollTop);
		}
	},
	toggle() {
		if (this.opened) {
			this.close();
		} else {
			this.open();
		}

		// console.log('toggle')
	},
};

module.exports = new Menu();
