const dom = require('../utils/DOM');
const env = require('../utils/ENV');
const Connector = require('../helpers/Connector');
const FormsValidation = require('./FormsValidation');

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
				// if (obj.name === 'agreement') {
				// 	value = value === 'on' ? 1 : 0;
				// }
				data[obj.name] = value;
			});

			console.log(data);

			let timeout = setTimeout(() => {
				$form.addClass(SENDING_CLASS);
				$form.find('[type="submit"]').attr('disabled', 'disabled');
			}, 200);

			let done = () => {
				clearTimeout(timeout);
				$form.removeClass(SENDING_CLASS).addClass(STATE_CLASS);
				$form.find('[type="submit"]').removeAttr('disabled');
				TweenMax.staggerFromTo($form.find('.form__state._state2 [data-stagger]'), 1.4, {
					alpha: 0,
					y: 20,
				}, {
					alpha: 1,
					y: 0,
				}, 0.6);

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
			};

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
		});
	});
}

Forms.prototype = {
};

module.exports = new Forms();
