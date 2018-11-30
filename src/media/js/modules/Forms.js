const dom = require('../utils/DOM');
const Connector = require('../helpers/Connector');
const FormsValidation = require('./FormsValidation');
const EventCreator = require('../helpers/event-creator');
const Popups = require('./Popups');

const SENDING_CLASS = '_sending';
const STATE_CLASS = '_state2';

function Forms() {
	this.$forms = dom.$body.find('form:not(.calc)');
	this.$forms.each((index, elem) => {
		let $form = $(elem);
		let formsValidation = FormsValidation.init($form);
		$form.on('submit', e => {
			e.preventDefault();

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
				$form.addClass(SENDING_CLASS);
				$form.find('[type="submit"]').attr('disabled', 'disabled');
			}, 200);

			const clearSendingState = () => {
				clearTimeout(timeout);
				$form.removeClass(SENDING_CLASS);
				$form.find('[type="submit"]').removeAttr('disabled');
			};

			const done = response => {
				clearSendingState();
				$form.addClass(STATE_CLASS);
				TweenMax.staggerFromTo(
					$form.find('.form__state._state2 [data-stagger]'),
					1.4,
					{
						alpha: 0,
						y: 20,
					},
					{
						alpha: 1,
						y: 0,
					},
					0.6
				);

				let $closestPopup = $form.closest('.popup');
				if ($closestPopup.length) {
					$closestPopup.animate({
						scrollTop: 0,
					});
				} else {
					let scrollTop = $form.offset().top - dom.$body.find('.header._fixed').outerHeight();
					dom.$document2.animate({
						scrollTop: scrollTop,
					});
				}

				let successName = data.name;
				let successDate = data.date;
				let successTime = data['datetime-select'];
				let successTimeArr = successTime.split('-');
				$form.find('[data-success-name]').text(`, ${successName}`);
				$form.find('[data-success-datetime]').html(`${successDate}<br> с ${successTimeArr[0]} до ${successTimeArr[1]}`);

				if (typeof response !== 'undefined') {
					if (response.success) {
						new EventCreator(document, 'promo:conversion', { requestId: response.request_id }).dispatch();
					}
				}
			};

			const errorHandler = err => {
				clearSendingState();
				err && console.error(err);
				Popups.open('form-error');
			};

			Connector.send(
				formAction,
				data,
				response => {
					let responseObject;
					let hasError = false;
					if (typeof response === 'string') {
						try {
							responseObject = JSON.parse(response);
							hasError = responseObject.success !== true;
						} catch (e) {
							console.error(e);
							hasError = true;
							return;
						}
					} else if (typeof response === 'object') {
						hasError = response.success !== true;
					} else {
						hasError = true;
					}

					// Done/Fail
					if (hasError) {
						errorHandler();
					} else {
						done();
					}
				},
				err => {
					errorHandler(err);
				}
			);
		});
	});
}

Forms.prototype = {};

module.exports = new Forms();
