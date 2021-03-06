const Inputmask = require('inputmask');
const dom = require('../utils/DOM');

const ERROR_CLASS = '_error';
const SUCCESS_CLASS = '_success';
const PARENT_CLASS = 'form__input-block';
const ERROR_MESSAGE_CLASS = 'form__error-message';
const USE_ERROR_ANIMATION = false;

function FormsValidation() {}
FormsValidation.prototype = {
	_checkInput(input) {
		let $input;
		if (input instanceof jQuery) {
			$input = input;
			input = $input.get(0);
		} else {
			$input = $(input);
		}
		let $parent = $input.closest('.' + PARENT_CLASS);
		let value = ($input.val() || '').trim();
		let nodeName = input.nodeName.toLowerCase();
		let inputType = nodeName === 'textarea' ? 'text' : $input.attr('type');
		let required = !!$input.attr('required');
		let res;
		let errorType = null;
		let valueExists;

		let pattern = $input.attr('pattern');
		pattern = !!pattern ? new RegExp(pattern, 'i') : false; // eslint-disable-line
		if (!pattern && inputType === 'email') {
			pattern = new RegExp('^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$', 'i');
		}

		let minValue = parseFloat($input.attr('min'));

		if (
			input.inputmask &&
			typeof input.inputmask.isComplete === 'function' &&
			input.inputmask &&
			input.inputmask.isComplete()
		) {
			$input.data('completedOnce', 'true');
		}

		switch (inputType) {
			case 'checkbox':
				valueExists = input.checked;
				break;

			case 'text':
			default:
				if (input.inputmask && typeof input.inputmask.isComplete === 'function') {
					valueExists = input.inputmask.isComplete();
				} else {
					valueExists = !!value;
				}
		}

		if (required && !valueExists) {
			errorType = 'required';
		} else if (valueExists && pattern !== false && !pattern.test(value)) {
			errorType = 'pattern';
		} else if (valueExists && !isNaN(minValue) && parseFloat(value) < minValue) {
			errorType = 'min';
		}

		if (errorType !== null) {
			let $errorMessage = $parent.find('.' + ERROR_MESSAGE_CLASS);
			if (!$errorMessage.length) {
				$errorMessage = $('<div class="form__error-message"></div>');
				$parent.append($errorMessage);
			}
			let $form = $input.closest('form');
			let attrPre = 'data-error-message-';
			let errorMessageText =
				$input.attr(attrPre + errorType) ||
				$form.attr(attrPre + errorType) ||
				$input.attr(attrPre + inputType) ||
				$form.attr(attrPre + inputType) ||
				'';
			$errorMessage.text(errorMessageText);

			if (!$parent.is(':visible')) {
				console.error('Invisible input found! Is it ok? Parent block:', $parent.get(0));
				return true;
			}
		}

		res = errorType === null;

		if (res === false) {
			$parent.addClass(ERROR_CLASS);
			$parent.removeClass(SUCCESS_CLASS);
		} else {
			$parent.removeClass(ERROR_CLASS);
			$parent.addClass(SUCCESS_CLASS);
		}

		return res;
	},
	init($form) {
		let $inputs = $form.find('input, select, textarea');
		$form.attr('novalidate', 'true');
		let totalInputs = $inputs.length;
		let self = this;

		// Phone inputs mask
		let $telInputs = $inputs.filter('[type="tel"]');
		$telInputs.each((index, elem) => {
			Inputmask({
				mask: '+7 (999) 999-99-99',
			}).mask(elem);
		});

		// Date inputs mask
		let $dateInputs = $inputs.filter('[type="date"]');
		$dateInputs.attr('type', 'text');
		$dateInputs.each((index, elem) => {
			Inputmask({
				mask: '99.99.9999',
				placeholder: 'дд.мм.гггг',
			}).mask(elem);
		});

		// Binds
		$inputs.each((index, elem) => {
			let $input = $(elem);
			let $parent = $input.closest(`.${PARENT_CLASS}`);
			if (!$input.is('[required]')) {
				$parent.addClass('_no-required');
			}
			if ($input.is('[data-disable-status]')) {
				$parent.addClass('_no-status');
			}
		});
		$inputs.on('input', e => this._checkInput(e.currentTarget));
		$form.on('reset', () => {
			$form.find(`.${PARENT_CLASS}`).removeClass(SUCCESS_CLASS);
		});

		return {
			validate($inputsToCheck) {
				if ($inputsToCheck && $inputsToCheck.length === 0) {
					return true;
				}

				let allowSend = true;
				let highlightDelay = 0;
				let hiddenInputs = [];

				for (let k = 0; k < totalInputs; k++) {
					let $input = $inputs.eq(k);
					if ($inputsToCheck && $inputsToCheck.length) {
						if ($inputsToCheck.index($input) < 0) {
							continue;
						}
					}
					let highlight = false;
					let $target = $input.closest('.' + PARENT_CLASS);
					if (!$input.is(':visible') && !!$input.attr('required')) {
						hiddenInputs.push($input);
					}

					if (!self._checkInput($input)) {
						highlight = true;
						allowSend = false;
					}

					$input.data('validatedOnce', 'true');

					if (highlight && USE_ERROR_ANIMATION) {
						let startDelay = highlightDelay / 10;
						TweenMax.to($target, 0.075, { x: -5, delay: startDelay });
						TweenMax.to($target, 0.15, { x: 5, delay: startDelay + 0.075, overwrite: false });
						TweenMax.to($target, 0.15, { x: -3, delay: startDelay + 0.075 + 0.15, overwrite: false });
						TweenMax.to($target, 0.15, { x: 3, delay: startDelay + 0.075 + 0.15 + 0.15, overwrite: false });
						TweenMax.to($target, 0.15, {
							x: 0,
							delay: startDelay + 0.075 + 0.15 + 0.15 + 0.15,
							overwrite: false,
							ease: Back.easeOut,
						});

						highlightDelay++;
					}
				}

				if (!allowSend) {
					let $firstErrorBlock = $inputs.closest(`.${PARENT_CLASS}.${ERROR_CLASS}`).first();
					let $closestPopup = $firstErrorBlock.closest('.popup');
					let scrollTop;
					let $elemToScroll;
					if ($closestPopup.length) {
						scrollTop = 0;
						$elemToScroll = false;
					} else {
						scrollTop = $firstErrorBlock.offset().top - window.innerHeight / 2;
						$elemToScroll = dom.$document2;
					}

					$elemToScroll &&
						$elemToScroll.animate({
							scrollTop: scrollTop,
						});
				}

				if (allowSend && hiddenInputs.length) {
					for (let i = 0; i < hiddenInputs.length; i++) {
						let $input = hiddenInputs[i];
						let $parent = $input.closest('.' + PARENT_CLASS);
						let message = $parent
							.find('.form__label-text, .input-checkbox__label + span')
							.first()
							.text()
							.trim();

						if ($input.attr('type') === 'checkbox' && !$input.get(0).checked) {
							if (confirm(message)) {
								$input.get(0).checked = true;
							} else {
								allowSend = false;
								break;
							}
						}
					}
				}

				return allowSend;
			},
		};
	},
};

module.exports = new FormsValidation();
