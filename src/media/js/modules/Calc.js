const dom = require('../utils/DOM');
const env = require('../utils/ENV');
const Connector = require('../helpers/Connector');
const FormsValidation = require('./FormsValidation');

const OPENED_CLASS = '_opened';
const ACTIVE_CLASS = '_active';
const FILLED_CLASS = '_filled';
const SENDING_CLASS = '_sending';
const STATE_CLASS = '_state2';
const IS_LOCAL = window.location.hostname && (window.location.hostname.indexOf('localhost') >= 0 || window.location.hostname.indexOf('192.168.') >= 0);

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
	this.$parents = dom.$body.find('.calc');

	// TODO: Отрефакторить.
	this.$parents.each((index, elem) => {
		let $parent = $(elem);
		this._init($parent);
	});
}

Calc.prototype = {
	_init($parent) {
		if (!$parent || !$parent.length) {
			return;
		}

		let $form = $parent;
		let $numInput = $parent.find('[name="num-input"]');
		let $numOutput = $parent.find('[name="num-output"]');
		let $slides = $parent.find('.calc__slide');
		let currentSlideIndex = 0;
		let currentRateName;
		let calcType = $parent.attr('data-type');
		console.log("calcType: " + calcType);

		$parent.find('.calc__selector._selectable').find('.calc__option').eq(0).addClass(ACTIVE_CLASS);

		let rates = {};
		$parent.find('.calc__rates [data-rate]').each((index, elem) => {
			let $elem = $(elem);
			let rateName = $elem.attr('data-rate');
			let rateValue = $elem.text();
			rateValue = rateValue.replace(',', '.');
			rateValue = parseFloat(rateValue);
			rates[rateName] = rateValue;
		});

		let updateCurrentRateName = () => {
			let $activeOption = $parent.find(`.calc__option.${ACTIVE_CLASS}`);
			let rateName = $activeOption.attr('data-rate');
			currentRateName = rateName;
			console.log("rateName: " + rateName);
			if (calcType === 'sell') {
				$parent.find('[data-summary-currency]').text(rateName);
			}
		};
		updateCurrentRateName();

		console.log("rates: ", rates);

		// TEMP: Позже написать правильный код. Пока что это только для демо: открыть/закрыть селектор.
		$parent.on('click', '.calc__selector', e => {
			let $elem = $(e.currentTarget);
			let $target = $(e.target);
			console.log($target.get(0));
			let $parent = $elem.closest('.calc__selector');
			if (!$parent.hasClass('_selectable')) {
				return;
			}

			// if ($parent.hasClass(OPENED_CLASS)) {
			// }
			// $elem.addClass(OPENED_CLASS);
			$elem.toggleClass(OPENED_CLASS);
			e.stopPropagation();
		});
		dom.$body.on('click', e => {
			let $target = $(e.target);
			let $closestSelector = $target.closest('.calc__selector');
			if ($closestSelector.length == 0) {
				$('.calc__selector').removeClass(OPENED_CLASS);
			}
		});
		$parent.on('click', '.calc__option', e => {
			let $elem = $(e.currentTarget);
			let $parent = $elem.closest('.calc__selector');
			if (!$parent.hasClass('_selectable') || !$parent.hasClass(OPENED_CLASS) || $elem.hasClass(ACTIVE_CLASS)) {
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
			let inputValueRaw = $numInput.val();
			let inputValueFormatted = inputValueRaw.replace(',', '.');

			inputValueFormatted = parseFloat(inputValueFormatted);

			// NOTE: Ограничиваем ввод суммой 1000000 (для любой валюты).
			inputValueFormatted = Math.min(1000000, inputValueFormatted);

			inputValueFormatted = formatMoney(inputValueFormatted);
			console.log("inputValueFormatted: " + inputValueFormatted);
			let inputValue = inputValueRaw.replace(',', '.');
			inputValue = parseFloat(inputValue);
			console.log("inputValueRaw: " + inputValueRaw);
			console.log("inputValue: " + inputValue);
			// inputValue = Math.min(1000000, inputValue);
			// console.log("inputValue: " + inputValue);

			// NOTE: Ограничиваем ввод суммой 1000000 (для любой валюты).
			inputValue = Math.min(1000000, inputValue);

			let inputValueToShow = inputValue;
			if (isNaN(inputValue)) {
				inputValueToShow = '';
			} else if (inputValueRaw) {
				if (inputValueRaw == inputValueRaw.charAt(inputValueRaw.length - 1) == '.' || (inputValueRaw.charAt(inputValueRaw.length - 2) == '.' && inputValueRaw.charAt(inputValueRaw.length - 1) == '0')) {
					console.log("raw");
					inputValueToShow = inputValueRaw;
				} else {
					console.log("no raw");
					console.log("inputValue: " + inputValue);
					inputValueToShow = inputValue;
				}
			}

			let outputValue;
			if (calcType === 'buy') {
				outputValue = inputValue * rates[currentRateName];
			} else {
				outputValue = inputValue / rates[currentRateName];
			}
			outputValue = parseFloat(outputValue.toFixed(2));
			console.log("outputValue: " + outputValue);
			let outputValueFormatted = formatMoney(outputValue);
			console.log("outputValueFormatted: " + outputValueFormatted);

			$numInput.val(inputValueToShow);
			// $numInput.val(inputValue.toFixed(4));
			// $numInput.val(inputValueFormatted);
			$numOutput.val(outputValueFormatted);
			$parent.find('[data-summary-value]').text(outputValueFormatted);

			if ($numInput.val() == '') {
				$numInput.removeClass(FILLED_CLASS);
			} else {
				$numInput.addClass(FILLED_CLASS);
			}
			if ($numOutput.val() == '') {
				$numOutput.removeClass(FILLED_CLASS);
			} else {
				$numOutput.addClass(FILLED_CLASS);
			}
		};
		$numInput.on('input', () => updateValues());

		TweenMax.set($slides.not('._relative'), {
			x: '120%',
			autoAlpha: 0,
		});
		let slidesCount = $slides.length;
		$parent.find('[data-steps-count]').text(slidesCount);
		let switchSlide = slideIndex => {
			slideIndex = Math.max(0, Math.min(slidesCount - 1, slideIndex));
			if (slideIndex == currentSlideIndex) {
				return;
			}

			let directionSign = slideIndex < currentSlideIndex ? 1 : -1;
			let duration = 1.2;

			TweenMax.to($slides.eq(currentSlideIndex), duration / 2, {
				x: `${120 * directionSign}%`,
				autoAlpha: 0,
				ease: Back.easeIn,
			});

			TweenMax.to($slides.eq(slideIndex), duration, {
				x: '0%',
				autoAlpha: 1,
				ease: Back.easeInOut.config(1),
			});

			currentSlideIndex = slideIndex;
			console.log("slideIndex: " + slideIndex);
			$parent.find('[data-step-number]').text(slideIndex + 1);

			// let slideHeight = 0;
			// if (slideIndex == 0) {
			// 	slideHeight = $slides.eq(slideIndex).height();
			// } else {
			// }
			let slideHeight = $slides.eq(slideIndex).find('.calc__paddings').outerHeight();

			// TODO: Доделать изменение высоты блока.
			if (slideIndex !== slidesCount - 1) {
				TweenMax.to($parent, 1, {
					height: slideHeight,
					ease: Back.easeInOut.config(1),
					onComplete: () => {
						$slides.removeClass('_relative').eq(slideIndex).addClass('_relative');
						$parent.css('height', '');
					},
				})
			}
			console.log("slideHeight: " + slideHeight);
		};

		$parent.on('click', '[data-step-next]', () => {
			switchSlide(currentSlideIndex + 1);
		});

		$parent.on('click', '[data-step-prev]', () => {
			switchSlide(currentSlideIndex - 1);
		});

		$parent.on('click', '[data-reset]', () => {
			$form.get(0).reset();
			updateValues();
			switchSlide(0);
		});

		let formsValidation = FormsValidation.init($form);
		$form.on('submit', e => {
			e.preventDefault();
			if (currentSlideIndex === 0) {
				let $requiredFields = $slides.eq(0).find('.form__input[required]');
				if ($requiredFields.length === 0 || formsValidation.validate($requiredFields)) {
					switchSlide(currentSlideIndex + 1);
				}
				return;
			} else if (currentSlideIndex === 1) {
				let $requiredFields = $slides.eq(0).find('.form__input[required]');
				if ($requiredFields.length > 0 && !formsValidation.validate($requiredFields)) {
					switchSlide(0);
					return;
				}
			}

			if (!formsValidation.validate()) {
				return;
			}

			let formAction = $form.attr('action');
			let formData = $form.serializeArray();
			let data = {};
			$(formData).each(function(index, obj) {
				let value = obj.value;
				// if (obj.name === 'agreement') {
				// 	value = value === 'on' ? 1 : 0;
				// }
				data[obj.name] = value;
			});

			console.log(data);

			let timeout = setTimeout(() => {
				$form.find('.form').addClass(SENDING_CLASS);
				$form.find('[type="submit"]').attr('disabled', 'disabled');
			}, 200);

			let done = () => {
				clearTimeout(timeout);
				$form.find('.form').removeClass(SENDING_CLASS).addClass(STATE_CLASS);
				$form.find('[type="submit"]').removeAttr('disabled');
				// TweenMax.staggerFromTo($form.find('[data-stagger]'), 1.4, {
				// 	alpha: 0,
				// 	y: 20,
				// }, {
				// 	alpha: 1,
				// 	y: 0,
				// }, 0.6);

				// let $closestPopup = $form.closest('.popup');
				// if ($closestPopup.length) {
				// 	$closestPopup.animate({
				// 		scrollTop: 0,
				// 	});
				// } else {
				// 	let scrollTop = $form.offset().top - dom.$body.find('.header._fixed').outerHeight();
				// 	dom.$document2.animate({
				// 		scrollTop: scrollTop,
				// 	});
				// }

				switchSlide(slidesCount - 1);
			};

			// TEMP: Чтобы хотя бы можно было посмотреть состояние отправки.
			if (IS_LOCAL) {
				setTimeout(done, 2000);
			} else {
				Connector.send(
					formAction,
					data,
					response => {
						console.log(response);
						done();
					},
					err => {
						console.error(err);
					},
				);
			}
		});
	},
};

module.exports = new Calc();
