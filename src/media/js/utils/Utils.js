module.exports = {
	now: function() {
		const P = 'performance';
		if (window[P] && window[P]['now']) {
			this.now = function() {
				return window.performance.now();
			};
		} else {
			this.now = function() {
				return +new Date();
			};
		}

		return this.now();
	},

	cubicProgress: function(value) {
		value = value < 0 ? 0 : value > 1 ? 1 : value;
		value /= 1 / 2;
		if (value < 1) {
			return (1 / 2) * value * value * value;
		}

		value -= 2;

		return (1 / 2) * (value * value * value + 2);
	},

	debounce: function(func, wait, immediate, fireOnce = false) {
		let timeout;
		wait = wait || 100;

		const resFunc = function() {
			const context = this,
				args = arguments;
			const later = function() {
				timeout = null;
				if (!immediate) {
					func.apply(context, args);
				}
			};

			const callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) {
				func.apply(context, args);
			}
		};

		fireOnce && resFunc();
		return resFunc;
	},

	throttle: function(func, ms) {
		let isThrottled = false;
		let savedArgs;
		let savedThis;
		ms = ms || 100;
		function wrapper() {
			if (isThrottled) {
				savedArgs = arguments;
				savedThis = this;
				return;
			}

			func.apply(this, arguments);

			isThrottled = true;

			setTimeout(function() {
				isThrottled = false;
				if (savedArgs) {
					wrapper.apply(savedThis, savedArgs);
					savedArgs = savedThis = null;
				}
			}, ms);
		}

		return wrapper;
	},

	// Stealed from:
	// https://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-dollars-currency-string-in-javascript
	formatNumber: function(n, c, d, t) {
		c = isNaN((c = Math.abs(c))) ? 2 : c;
		d = d == undefined ? ',' : d;
		t = t == undefined ? ' ' : t;
		let s = n < 0 ? '-' : '';
		let i = String(parseInt((n = Math.abs(Number(n) || 0).toFixed(c))));
		let j = (j = i.length) > 3 ? j % 3 : 0;
		return (
			s +
			(j ? i.substr(0, j) + t : '') +
			i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) +
			(c
				? d +
				  Math.abs(n - i)
						.toFixed(c)
						.slice(2)
				: '')
		);
	},

	declOfNum: function(number, titles) {
		const cases = [2, 0, 1, 1, 1, 2];
		return titles[number % 100 > 4 && number % 100 < 20 ? 2 : cases[number % 10 < 5 ? number % 10 : 5]];
	},
};
