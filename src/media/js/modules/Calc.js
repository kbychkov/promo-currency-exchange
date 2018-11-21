const dom = require('../utils/DOM');
const env = require('../utils/ENV');

const OPENED_CLASS = '_opened';

function Calc() {
	this.$parent = dom.$body.find('.calc');

	// TEMP: Позже написать правильный код. Пока что это только для демо: открыть/закрыть селектор.
	this.$parent.on('click', '.calc__selector', e => $(e.currentTarget).addClass(OPENED_CLASS));
	dom.$body.on('click', e => $(e.target).closest('.calc__selector').length == 0 && $('.calc__selector').removeClass(OPENED_CLASS));
}

Calc.prototype = {
};

module.exports = new Calc();
