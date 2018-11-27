const dom = require('../utils/DOM');
const Utils = require('../utils/Utils');
const Connector = require('../helpers/Connector');
const FormsValidation = require('./FormsValidation');

const OPENED_CLASS = '_opened';
const ACTIVE_CLASS = '_active';
const FILLED_CLASS = '_filled';
const SENDING_CLASS = '_sending';
const STATE_CLASS = '_state2';
const IS_LOCAL =
	window.location.hostname &&
	(window.location.hostname.indexOf('localhost') >= 0 || window.location.hostname.indexOf('192.168.') >= 0);

function Calc() {
	dom.$body.find('.calc').each((index, elem) => {
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
		let slidesCount = $slides.length;
		let rates = {};
		let formsValidation = FormsValidation.init($form);

		$parent
			.find('.calc__selector._selectable')
			.find('.calc__option')
			.eq(0)
			.addClass(ACTIVE_CLASS);
		$parent.find('[data-steps-count]').text(slidesCount);

		$parent.find('.calc__rates [data-rate]').each((index, elem) => {
			let $elem = $(elem);
			let rateName = $elem.attr('data-rate');
			let rateValue = $elem.text();
			rateValue = rateValue.replace(',', '.');
			rateValue = parseFloat(rateValue);
			rates[rateName] = rateValue;
		});

		const updateValues = () => {
			let inputValueRaw = $numInput.val();
			let inputValue = inputValueRaw.replace(',', '.');
			inputValue = parseFloat(inputValue);
			// Ограничиваем ввод суммой 1000000 (для любой валюты).
			inputValue = Math.min(1000000, inputValue);

			let inputValueToShow = inputValue;
			if (isNaN(inputValue)) {
				inputValueToShow = '';
			} else if (inputValueRaw) {
				if (
					(inputValueRaw == inputValueRaw.charAt(inputValueRaw.length - 1)) == '.' ||
					(inputValueRaw.charAt(inputValueRaw.length - 2) == '.' &&
						inputValueRaw.charAt(inputValueRaw.length - 1) == '0')
				) {
					inputValueToShow = inputValueRaw;
				} else {
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
			let outputValueFormatted = Utils.formatNumber(outputValue);

			$numInput.val(inputValueToShow);
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

		const updateCurrentRateName = () => {
			let $activeOption = $parent.find(`.calc__option.${ACTIVE_CLASS}`);
			let rateName = $activeOption.attr('data-rate');
			currentRateName = rateName;
			if (calcType === 'sell') {
				$parent.find('[data-summary-currency]').text(rateName);
			}
		};

		const switchSlide = slideIndex => {
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
			$parent.find('[data-step-number]').text(slideIndex + 1);

			let slideHeight = $slides
				.eq(slideIndex)
				.find('.calc__paddings')
				.outerHeight();

			if (slideIndex !== slidesCount - 1) {
				TweenMax.to($parent, 1, {
					height: slideHeight,
					ease: Back.easeInOut.config(1),
					onComplete: () => {
						$slides
							.removeClass('_relative')
							.eq(slideIndex)
							.addClass('_relative');
						$parent.css('height', '');
					},
				});
			}
		};

		updateCurrentRateName();

		$parent.on('click', '.calc__selector', e => {
			let $elem = $(e.currentTarget);
			let $parent = $elem.closest('.calc__selector');
			if (!$parent.hasClass('_selectable')) {
				return;
			}

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

		$numInput.on('input', () => updateValues());

		TweenMax.set($slides.not('._relative'), {
			x: '120%',
			autoAlpha: 0,
		});

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
				data[obj.name] = value;
			});

			let timeout = setTimeout(() => {
				$form.find('.form').addClass(SENDING_CLASS);
				$form.find('[type="submit"]').attr('disabled', 'disabled');
			}, 200);

			let done = () => {
				clearTimeout(timeout);
				$form
					.find('.form')
					.removeClass(SENDING_CLASS)
					.addClass(STATE_CLASS);
				$form.find('[type="submit"]').removeAttr('disabled');
				switchSlide(slidesCount - 1);
			};

			if (IS_LOCAL) {
				setTimeout(done, 2000);
			} else {
				Connector.send(
					formAction,
					data,
					response => {
						done(response);
					},
					err => {
						console.error(err);
					}
				);
			}
		});
	},
};

module.exports = new Calc();
