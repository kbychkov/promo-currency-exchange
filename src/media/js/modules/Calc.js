const dom = require('../utils/DOM');
const env = require('../utils/ENV');
const FormsValidation = require('./FormsValidation');

const OPENED_CLASS = '_opened';
const ACTIVE_CLASS = '_active';
const FILLED_CLASS = '_filled';

// Stealed from:
// https://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-dollars-currency-string-in-javascript
const formatMoney = function(n, c, d, t) {
	c = isNaN(c = Math.abs(c)) ? 2 : c;
	d = d == undefined ? ',' : d;
	t = t == undefined ? ' ' : t;
	let s = n < 0 ? '-' : '';
	let i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c)));
	let j = (j = i.length) > 3 ? j % 3 : 0;
	return s + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
};

function Calc() {
	this.$parent = dom.$body.find('.calc');
	this.$form = this.$parent;
	this.$numInput = this.$parent.find('[name="num-input"]');
	this.$numOutput = this.$parent.find('[name="num-output"]');
	this.$slides = this.$parent.find('.calc__slide');
	this.currentSlideIndex = 0;

	this.$parent.find('.calc__selector._selectable').find('.calc__option').eq(0).addClass(ACTIVE_CLASS);

	this.rates = {};
	this.$parent.find('.calc__rates [data-rate]').each((index, elem) => {
		let $elem = $(elem);
		let rateName = $elem.attr('data-rate');
		let rateValue = $elem.text();
		rateValue = rateValue.replace(',', '.');
		rateValue = parseFloat(rateValue);
		this.rates[rateName] = rateValue;
	});

	let updateCurrentRateName = () => {
		let $activeOption = this.$parent.find(`.calc__option.${ACTIVE_CLASS}`);
		let rateName = $activeOption.attr('data-rate');
		this.currentRateName = rateName;
		console.log("rateName: " + rateName);
	};
	updateCurrentRateName();

	console.log("this.rates: ", this.rates);

	// TEMP: Позже написать правильный код. Пока что это только для демо: открыть/закрыть селектор.
	this.$parent.on('click', '.calc__selector', e => $(e.currentTarget).addClass(OPENED_CLASS));
	dom.$body.on('click', e => $(e.target).closest('.calc__selector').length == 0 && $('.calc__selector').removeClass(OPENED_CLASS));
	this.$parent.on('click', '.calc__option', e => {
		let $elem = $(e.currentTarget);
		let $parent = $elem.closest('.calc__selector');
		if (!$parent.hasClass(OPENED_CLASS)) {
			return;
		}
		e.stopPropagation();

		let $activeOption = $parent.find(`.calc__option.${ACTIVE_CLASS}`);
		let $replacedOption = $activeOption.replaceWith($elem.addClass(ACTIVE_CLASS));
		$parent.find('.calc__options').append($replacedOption.removeClass(ACTIVE_CLASS));
		$parent.removeClass(OPENED_CLASS);
		updateCurrentRateName();
		updateValues();
	});

	let updateValues = () => {
		let inputValueRaw = this.$numInput.val();
		let inputValueFormatted = inputValueRaw.replace(',', '.');
		inputValueFormatted = parseFloat(inputValueFormatted);
		inputValueFormatted = formatMoney(inputValueFormatted);
		console.log("inputValueFormatted: " + inputValueFormatted);
		let inputValue = inputValueRaw.replace(',', '.');
		inputValue = parseFloat(inputValue);
		console.log("inputValueRaw: " + inputValueRaw);
		console.log("inputValue: " + inputValue);
		let outputValue = inputValue * this.rates[this.currentRateName];
		outputValue = parseFloat(outputValue.toFixed(2));
		console.log("outputValue: " + outputValue);
		let outputValueFormatted = formatMoney(outputValue);
		console.log("outputValueFormatted: " + outputValueFormatted);

		let inputValueToShow = inputValue;
		if (isNaN(inputValue)) {
			inputValueToShow = '';
		} else if (inputValueRaw) {
			inputValueToShow = inputValueRaw == inputValue + '.' || inputValueRaw.charAt(inputValueRaw.length - 1) == '0' ? inputValueRaw : inputValue;
		}
		this.$numInput.val(inputValueToShow);
		// this.$numInput.val(inputValue.toFixed(4));
		// this.$numInput.val(inputValueFormatted);
		this.$numOutput.val(outputValueFormatted);
		this.$parent.find('[data-summary-value]').text(outputValueFormatted);

		if (this.$numInput.val() == '') {
			this.$numInput.removeClass(FILLED_CLASS);
		} else {
			this.$numInput.addClass(FILLED_CLASS);
		}
		if (this.$numOutput.val() == '') {
			this.$numOutput.removeClass(FILLED_CLASS);
		} else {
			this.$numOutput.addClass(FILLED_CLASS);
		}
	};
	this.$numInput.on('input', () => updateValues());

	TweenMax.set(this.$slides.not('._relative'), {
		x: '120%',
		autoAlpha: 0,
	});
	let slidesCount = this.$slides.length;
	this.$parent.find('[data-steps-count]').text(slidesCount);
	let switchSlide = slideIndex => {
		slideIndex = Math.max(0, Math.min(slidesCount - 1, slideIndex));
		if (slideIndex == this.currentSlideIndex) {
			return;
		}

		let directionSign = slideIndex < this.currentSlideIndex ? 1 : -1;
		let duration = 1.2;

		TweenMax.to(this.$slides.eq(this.currentSlideIndex), duration / 2, {
			x: `${120 * directionSign}%`,
			autoAlpha: 0,
			ease: Back.easeIn,
		});

		TweenMax.to(this.$slides.eq(slideIndex), duration, {
			x: '0%',
			autoAlpha: 1,
			ease: Back.easeInOut.config(1),
		});

		this.currentSlideIndex = slideIndex;
		console.log("slideIndex: " + slideIndex);
		this.$parent.find('[data-step-number]').text(slideIndex + 1);

		// let slideHeight = 0;
		// if (slideIndex == 0) {
		// 	slideHeight = this.$slides.eq(slideIndex).height();
		// } else {
		// }
		let slideHeight = this.$slides.eq(slideIndex).find('.calc__paddings').outerHeight();

		// TODO: Доделать изменение высоты блока.
		TweenMax.to(this.$parent, 1, {
			height: slideHeight,
			ease: Back.easeInOut.config(1),
			// onComplete: () => {
			// 	this.$slides.eq(slideIndex).addClass('_relative');
			// },
		})
		console.log("slideHeight: " + slideHeight);
	};

	this.$parent.on('click', '[data-step-next]', () => {
		switchSlide(this.currentSlideIndex + 1);
	});

	this.$parent.on('click', '[data-step-prev]', () => {
		switchSlide(this.currentSlideIndex - 1);
	});

	this.$parent.on('click', '[data-reset]', () => {
		this.$form.get(0).reset();
		updateValues();
		switchSlide(0);
	});

	let $form = this.$form;
	let formsValidation = FormsValidation.init($form);
	$form.on('submit', e => {
		e.preventDefault();
		if (this.currentSlideIndex === 0) {
			if (formsValidation.validate(this.$slides.eq(0).find('.form__input[required]'))) {
				switchSlide(this.currentSlideIndex + 1);
			}
			return;
		}

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

		switchSlide(slidesCount - 1);

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
}

Calc.prototype = {
};

module.exports = new Calc();
