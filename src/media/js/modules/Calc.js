const dom = require('../utils/DOM');
const env = require('../utils/ENV');

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
	this.$numInput = this.$parent.find('[name="num-input"]');
	this.$numOutput = this.$parent.find('[name="num-output"]');

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
}

Calc.prototype = {
};

module.exports = new Calc();
