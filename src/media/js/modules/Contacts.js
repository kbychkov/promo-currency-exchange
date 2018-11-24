/* globals ymaps */

const dom = require('../utils/DOM');
const env = require('../utils/ENV');
const Utils = require('../utils/Utils');

function Contacts() {
	this.$parent = dom.$body.find('.contacts-cities');
	if (!this.$parent.length) {
		return;
	}

	this.$widget = dom.$body.find('.contacts-widget');
	this.$captionElement = this.$widget.find('[data-caption-element]');
	// this.$infoContainer = this.$widget.find('[data-info-container]');
	this.maps = [];
	this.$widgetBlockExample = this.$widget.find('.contacts-widget__flex').clone(false);

	this.$parent.on('click', '.contacts-cities__link', e => this._linksClickHandler(e));

	let init = () => {
		ymaps.ready(() => {
			this.mapsReady = true;
			this._createMap(this.$widget);
		});
	};

	// Функция ymaps.ready() будет вызвана, когда
	// загрузятся все компоненты API, а также когда будет готово DOM-дерево.
	if (typeof ymaps !== 'undefined') {
		init();
		// return;
	} else {
		$.getScript('//api-maps.yandex.ru/2.1/?apikey=a2619744-4796-4321-85a9-b2a69e1cdc81&lang=ru_RU', () => {
			init();
		});
	}

	dom.$window.on('resize', Utils.debounce(() => {
		this.maps.forEach(m => m.container.fitToViewport());
		// this.Map && this.Map.container.fitToViewport();
	}));
}

Contacts.prototype = {
	_createMap($container, coordinates = [62.617921, 92.946696], zoom = 2) {
		if (typeof ymaps === 'undefined' || typeof ymaps.Map === 'undefined') {
			return;
		}

		// Создание карты.
		let map = new ymaps.Map($container.find('[data-widget-map]').get(0), {
			// Координаты центра карты.
			// Порядок по умолчанию: «широта, долгота».
			// Чтобы не определять координаты центра карты вручную,
			// воспользуйтесь инструментом Определение координат.
			center: coordinates,
			// Уровень масштабирования. Допустимые значения:
			// от 0 (весь мир) до 19.
			zoom: zoom,
		});

		console.log("push map. zoom", zoom, $container.get(0));
		this.maps.push(map);
	},
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

		let widgetCaption = $parent.attr('data-widget-caption');
		this.$captionElement.text(widgetCaption || '');

		let $widgetBlocks = this.$widget.find('.contacts-widget__flex');

		if ($widgetMarkupContainer.length == 0 || typeof ymaps === 'undefined' || typeof ymaps.Map === 'undefined') {
			this._setWidgetInfo();

		} else {
			if ($widgetMarkupContainer.length < this.maps.length) {
				console.log("here");
				this.maps.forEach((m, index) => {
					console.log("index: " + index);
					if (index < $widgetMarkupContainer.length) {
						return;
					}
					console.log("destroy");
					m.destroy();
					$widgetBlocks.eq(index).remove();
					this.maps[index] = null;
				});
				console.log(this.maps);
				this.maps = this.maps.slice(0, $widgetMarkupContainer.length);
			}

			$widgetMarkupContainer.each((index, elem) => {
				let $markupContainer = $(elem);

				// let $widgetBlock = $widgetBlock
				if (index > 0 && $widgetBlocks.eq(index).length == 0) {
					console.log("create");
					let $clone = this.$widgetBlockExample.clone();
					// $widgetBlocks.last().after($clone);
					this.$widget.find('.contacts-widget__flex').last().after($clone);
					// console.log($widgetBlocks.last().get(0));
					console.log(this.$widget.find('.contacts-widget__flex').last().get(0));
					this._createMap($clone);
				}
				let coordinates = $markupContainer.attr('data-widget-map-coordinates');
				if (coordinates) {
					coordinates = coordinates.split(',').map(el => parseFloat(el));
				}
				console.log("coordinates", coordinates);
				let zoom = $markupContainer.attr('data-widget-map-zoom');
				if (zoom) {
					zoom = parseInt(zoom);
				}
				console.log("zoom", zoom);

				let widgetMarkup = $markupContainer.html();

				// console.log("widgetCaption: " + widgetCaption);
				// console.log("widgetMarkup.length", widgetMarkup.length);

				this._setMap(coordinates, zoom, index);
				this._setWidgetInfo(widgetMarkup, index);
			});
		}
	},
	_setMap(coordinates, zoom = 10, mapIndex = 0) {
		console.log("_setMap mapIndex", mapIndex);
		if (!this.mapsReady || !coordinates || coordinates.length != 2) {
			return;
		}

		// this.Map.setCenter(coordinates, zoom).then(() => {
		let map = this.maps[mapIndex];
		if (!map) {
			return;
		}

		map.setCenter(coordinates, zoom).then(() => {
			map.container.fitToViewport();
		});
	},
	_setWidgetInfo(markup, mapIndex = 0) {
		console.log("_setWidgetInfo mapIndex", mapIndex);
		// if (!markup) {
		// 	return;
		// }

		let $infoContainers = this.$widget.find('[data-info-container]');
		$infoContainers.eq(mapIndex).html(markup || '');
	},
};

module.exports = new Contacts();
