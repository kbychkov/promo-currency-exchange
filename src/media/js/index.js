import { TweenMax } from 'gsap';
global.TweenMax = TweenMax;
global.$ = global.jQuery = require('jquery');
require('./utils/jqExtensions');

global.BCS && window.location.reload();

// prettier-ignore
const App = new function App() { // eslint-disable-line
	this.env = require('./utils/ENV');
	this.dom = require('./utils/DOM');
	this.utils = require('./utils/Utils');

	// Fix 100vh bug on iPhoneX and other mobile devices
	{
		let tolerance = 10;
		let $check100vhElem = $('<div></div>');
		$check100vhElem.css({
			'visibility': 'hidden',
			'position': 'absolute',
			'left': '0',
			'top': '0',
			'width': '1px',
			'height': '100vh',
		});
		this.dom.$body.append($check100vhElem);
		let real100vhHeight = $check100vhElem.height();
		$check100vhElem.remove();
		let delta = real100vhHeight - window.innerHeight;
		if (Math.abs(delta) > tolerance) {
			this.dom.$html.addClass('_fix100vh');
			typeof document.documentElement.style.setProperty === 'function' && document.documentElement.style.setProperty('--fix100vhValue', `${delta}px`);

			if (localStorage) {
				localStorage.setItem('fix100vhValue', delta);
			}
		}
	}

	this.classes = {
		Callback: require('./classes/Callback')
	};

	this.helpers = {
		SVGSprites: require('./helpers/SVGSprites')
	};

	this.modules = {
		Menu: require('./modules/Menu'),
		Popups: require('./modules/Popups'),
		Switchers: require('./modules/Switchers'),
		Calc: require('./modules/Calc'),
		FormsValidation: require('./modules/FormsValidation'),
	};

	// Startup
	$(() => {
		// Remove _loading modificator
		this.dom.$html.removeClass('_loading');

		// TODO: Подумать, стоит ли это вынести в отдельный модуль.
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

		// TODO: Подумать, стоит ли это вынести в отдельный модуль.
		this.$forms = this.dom.$body.find('form');
		this.$forms.each((index, elem) => {
			let $form = $(elem);
			let formsValidation = this.modules.FormsValidation.init($form);
			$form.on('submit', e => {
				e.preventDefault();

				if (!formsValidation.validate()) {
					return;
				}

				let formData = $form.serializeArray();
				let data = {};
				$(formData).each(function(index, obj) {
					let value = obj.value;
					if (obj.name === 'agreement') {
						value = value === 'on' ? 1 : 0;
					}
					data[obj.name] = value;
				});

				console.log(data);

				// let timeout = setTimeout(() => {
				// 	this.$form.addClass(SENDING_CLASS);
				// }, 200);

				// let done = () => {
				// 	clearTimeout(timeout);
				// 	this.$form.removeClass(SENDING_CLASS).addClass(STATE_CLASS);
				// 	TweenMax.staggerFromTo(this.$form.find('.form__state._state2 [data-stagger]'), 1.4, {
				// 		alpha: 0,
				// 		y: 20,
				// 	}, {
				// 		alpha: 1,
				// 		y: 0,
				// 	}, 0.6);
				// 	this.$form.closest('.ps').scrollTop(0);
				// };

				// Connector.send('send_feedback', data, response => {
				// 	console.log(response);
				// 	done();
				// });
			});
		});
	});
}();

// App → ProjectName
(global.BCS = global.App = App), delete global.App; //eslint-disable-line

if (module.hot) {
	module.hot.accept();
}
