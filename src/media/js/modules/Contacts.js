/* globals ymaps */

const dom = require('../utils/DOM');
const Utils = require('../utils/Utils');

// NOTE: Документация по работе с Яндекс-картами:
// https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/Map-docpage/
function Contacts() {
	this.$parent = dom.$body.find('.contacts-cities');
	if (!this.$parent.length) {
		return;
	}

	this.$widget = dom.$body.find('.contacts-widget');
	this.$captionElement = this.$widget.find('[data-caption-element]');
	this.maps = [];
	this.$widgetBlockExample = this.$widget.find('.contacts-widget__flex').clone(false);

	const init = () => {
		ymaps.ready(() => {
			this.mapsReady = true;
			this._createMap(this.$widget);
		});
	};

	if (typeof ymaps !== 'undefined') {
		init();
	} else {
		$.getScript('//api-maps.yandex.ru/2.1/?apikey=a2619744-4796-4321-85a9-b2a69e1cdc81&lang=ru_RU', () => {
			init();
		});
	}

	this.$parent.on('click', '.contacts-cities__link', e => this._linksClickHandler(e));

	dom.$window.on(
		'resize',
		Utils.debounce(() => {
			this.maps.forEach(m => m.container.fitToViewport());
		})
	);
}

Contacts.prototype = {
	_createMap($container, coordinates = [62.617921, 92.946696], zoom = 2) {
		if (typeof ymaps === 'undefined' || typeof ymaps.Map === 'undefined') {
			return;
		}

		let map = new ymaps.Map($container.find('[data-widget-map]').get(0), {
			center: coordinates,
			zoom: zoom,
		});

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
				this.maps.forEach((m, index) => {
					if (index < $widgetMarkupContainer.length) {
						return;
					}
					m.destroy();
					$widgetBlocks.eq(index).remove();
					this.maps[index] = null;
				});
				this.maps = this.maps.slice(0, $widgetMarkupContainer.length);
			}

			$widgetMarkupContainer.each((index, elem) => {
				let $markupContainer = $(elem);

				if (index > 0 && $widgetBlocks.eq(index).length == 0) {
					let $clone = this.$widgetBlockExample.clone();
					this.$widget
						.find('.contacts-widget__flex')
						.last()
						.after($clone);
					this._createMap($clone);
				}

				let coordinates = $markupContainer.attr('data-widget-map-coordinates');
				if (coordinates) {
					coordinates = coordinates.split(',').map(el => parseFloat(el));
				}

				let zoom = $markupContainer.attr('data-widget-map-zoom');
				if (zoom) {
					zoom = parseInt(zoom);
				}

				let widgetMarkup = $markupContainer.html();

				this._setMap(coordinates, zoom, index);
				this._setWidgetInfo(widgetMarkup, index);
			});
		}
	},
	_setMap(coordinates, zoom = 10, mapIndex = 0) {
		if (!this.mapsReady || !coordinates || coordinates.length != 2) {
			return;
		}

		let map = this.maps[mapIndex];
		if (!map) {
			return;
		}

		map.setCenter(coordinates, zoom).then(() => {
			map.container.fitToViewport();

			let placemark = new ymaps.Placemark(
				coordinates,
				{},
				{
					preset: 'islands#icon',
					iconColor: '#0073F1',
				}
			);
			map.geoObjects.add(placemark);
		});
	},
	_setWidgetInfo(markup, mapIndex = 0) {
		let $infoContainers = this.$widget.find('[data-info-container]');
		$infoContainers.eq(mapIndex).html(markup || '');
	},
};

module.exports = new Contacts();
