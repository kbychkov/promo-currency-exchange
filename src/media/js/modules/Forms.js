const dom = require('../utils/DOM');
const Connector = require('../helpers/Connector');
const FormsValidation = require('./FormsValidation');

const SENDING_CLASS = '_sending';
const STATE_CLASS = '_state2';
const IS_LOCAL =
	window.location.hostname &&
	(window.location.hostname.indexOf('localhost') >= 0 || window.location.hostname.indexOf('192.168.') >= 0);

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

			let done = () => {
				clearTimeout(timeout);
				$form.removeClass(SENDING_CLASS).addClass(STATE_CLASS);
				$form.find('[type="submit"]').removeAttr('disabled');
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
				$form
					.find('[data-success-datetime]')
					.html(`${successDate}<br> с ${successTimeArr[0]} до ${successTimeArr[1]}`);
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
	});
}

Forms.prototype = {};

module.exports = new Forms();
