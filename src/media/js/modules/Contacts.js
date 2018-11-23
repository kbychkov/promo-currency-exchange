/* globals ymaps */

const dom = require('../utils/DOM');
const env = require('../utils/ENV');

function Contacts() {
	this.$parent = dom.$body.find('.contacts-cities');
	this.$widget = dom.$body.find('.contacts-widget');
	this.$captionElement = this.$widget.find('[data-caption-element]');
	this.$infoContainer = this.$widget.find('[data-info-container]');

	this.$parent.on('click', '.contacts-cities__link', e => this._linksClickHandler(e));

	// Функция ymaps.ready() будет вызвана, когда
	// загрузятся все компоненты API, а также когда будет готово DOM-дерево.
	ymaps.ready(() => {
		this.mapsReady = true;

		// Создание карты.
		this.Map = new ymaps.Map("widget-map", {
			// Координаты центра карты.
			// Порядок по умолчанию: «широта, долгота».
			// Чтобы не определять координаты центра карты вручную,
			// воспользуйтесь инструментом Определение координат.
			center: [55.76, 37.64],
			// Уровень масштабирования. Допустимые значения:
			// от 0 (весь мир) до 19.
			zoom: 1,
		});
	});
	function init(){
	}
}

Contacts.prototype = {
	_linksClickHandler(e) {
		e.preventDefault();
		let $link = $(e.currentTarget);
		let $parent = $link.closest('.contacts-cities__item');
		let $widgetMarkupContainer = $parent.find('[data-widget-markup]');

		if (!this.widgetOpened) {
			this.widgetOpened = true;
			this.$widget.slideDown();
		}

		let scrTop = this.$widget.offset().top - 100;
		dom.$document2.animate({
			scrollTop: scrTop,
		});

		let coordinates = $parent.attr('data-widget-map-coordinates');
		if (coordinates) {
			coordinates = coordinates.split(',').map(el => parseFloat(el));
		}
		console.log("coordinates", coordinates);
		let zoom = $parent.attr('data-widget-map-zoom');
		if (zoom) {
			zoom = parseInt(zoom);
		}
		console.log("zoom", zoom);

		let widgetCaption = $parent.attr('data-widget-caption');
		let widgetMarkup = $widgetMarkupContainer.html();

		// console.log("widgetCaption: " + widgetCaption);
		// console.log("widgetMarkup.length", widgetMarkup.length);

		this._setMap(coordinates, zoom);
		this._setWidgetInfo(widgetCaption, widgetMarkup);
	},
	_setMap(coordinates, zoom = 10) {
		if (!this.mapsReady || !coordinates || coordinates.length != 2) {
			return;
		}

		this.Map.setCenter(coordinates, zoom);

		// TODO: Посмотреть, есть ли для этого более подходящий способ
		// (например, что-нибудь типа метода update для карт).
		// dom.$window.trigger('resize');
		// this.Map.update();
	},
	_setWidgetInfo(caption, markup) {
		if (!caption || !markup) {
			return;
		}

		this.$captionElement.text(caption);
		this.$infoContainer.html(markup);
	},
};

module.exports = new Contacts();
