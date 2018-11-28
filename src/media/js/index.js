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
		Connector: require('./helpers/Connector'),
	};

	this.modules = {
		Menu: require('./modules/Menu'),
		Popups: require('./modules/Popups'),
		Switchers: require('./modules/Switchers'),
		Calc: require('./modules/Calc'),
		FormsValidation: require('./modules/FormsValidation'),
		Contacts: require('./modules/Contacts'),
		DateTime: require('./modules/DateTime'),
		Forms: require('./modules/Forms'),
		VideoPopup: require('./modules/VideoPopup'),
	};

	// Startup
	$(() => {
		// Remove _loading modificator
		this.dom.$html.removeClass('_loading');
	});
}();

// App → ProjectName
(global.BCS = global.App = App), delete global.App; //eslint-disable-line

if (module.hot) {
	module.hot.accept();
}
