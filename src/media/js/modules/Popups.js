const dom = require('../utils/DOM');

const DEBUG = false;

// NOTE: Модуль взят с моего личного стартера, которым пользовался на предыдущем месте работы.
// При наличии времени, заменить на тот, который есть в Сборке.
function Popups() {
	var popupClass = 'popup';
	var popups = $('.' + popupClass);
	if (!popups.length) {
		return false;
	}

	// Локальные переменные
	var openedClass = 'is-opened';
	var $body = dom.$body;
	var $html = dom.$html;
	var $document = dom.$document2;
	var $window = dom.$window;
	var dAttrSelector = 'data-popup-selector';
	var dAttrBgClose = 'data-bg-close';
	var hiddenClass = 'hidden';
	var evNameOpen = 'popups:open';
	var evNameClose = 'popups:close';
	var openPopupBtns = $('.js-open-popup');
	var closePopupBtns = $('.js-close-popup');
	var $wrapper = dom.$wrapper;
	var wrapperAbsClass = 'is-abs';
	var popupOpenedClass = 'is-popup-opened';
	var transitionEventEnd = (function() {
		var el, t, transitions;
		el = document.createElement('fakeelement');
		transitions = {
			transition: 'transitionend',
			OTransition: 'oTransitionEnd',
			MozTransition: 'transitionend',
			WebkitTransition: 'webkitTransitionEnd',
		};
		for (t in transitions) {
			if (el.style[t] !== undefined) {
				el = null;
				return transitions[t];
			}
		}
		return false;
	})();
	var fixedPageElems = $('html, .header, #video');
	var hasFixedElems = fixedPageElems.length > 0;
	var hideDelayDefault = 3500;
	var dAttrAutohide = 'data-autohide';
	var dAttrHide = 'data-hide';
	var autohidePopups = popups.filter('[' + dAttrAutohide + '="true"]');
	var dAttrClose = 'data-close-popup';

	// Перемещаем все всплывашки в конец <body>.
	// Это нужно для того, чтобы при открытии всплывашки,
	// событие 'scroll' всплывало до <body> и <html>,
	// но НЕ всплывало до <div class='l-wrapper'>.
	// Это важно, так как при открытии всплывашки прокрутка
	// убирается у <body> и появляется у <div class='l-wrapper'>.
	// Тем самым, мы 'отменяем скролл'.
	//
	// NOTE: На самом деле, отменить стандартный скролл браузера нельзя
	// (иначе не было бы всей этой истории).
	// Можно отменить, например, всплытие события 'click' или действие по умолчанию для него.
	// Но ряд событий отменить или прервать всплытие нельзя.
	popups.each(function() {
		var self = $(this);
		$body.append(self.removeClass(hiddenClass));
	});

	// Вспомогательные функции
	var getScrollbarWidth = function() {
		var inner, outer, widthNoScroll, widthWithScroll, wrapper;
		wrapper = $wrapper.get(0);
		if (!wrapper || wrapper.clientHeight <= window.innerHeight) {
			return 0;
		}
		outer = document.createElement('div');
		inner = document.createElement('div');
		widthNoScroll = undefined;
		widthWithScroll = undefined;
		outer.style.visibility = 'hidden';
		outer.style.width = '100px';
		document.body.appendChild(outer);
		widthNoScroll = outer.offsetWidth;

		// Force scrollbars
		outer.style.overflow = 'scroll';

		// Add inner div
		inner.style.width = '100%';
		outer.appendChild(inner);
		widthWithScroll = inner.offsetWidth;

		// Remove divs
		outer.parentNode.removeChild(outer);
		outer = inner = null;
		return widthNoScroll - widthWithScroll;
	};
	var getScrTop = function() {
		var scrTop = Math.max($document.scrollTop(), $body.scrollTop(), $wrapper.scrollTop(), 0);
		return scrTop;
	};
	var getOpenedPopups = function() {
		return popups.filter('.' + openedClass);
	};

	var popupOpen = function() {
		var self = $(this);
		if (self.hasClass(openedClass)) {
			return;
		}

		// Если до этого уже были открыты всплывашки,
		// то вычисляем наибольший z-index, и присваиваем его
		// новой открывающейся всплывашке.
		// Иначе возможны ситуации, когда всплывашка открылась, но из-за расположения по вёрстке
		// оказалась ниже (за счет одинакового z-index), и в итоге её не видно.
		var openedPopups = getOpenedPopups();
		if (openedPopups.length > 0) {
			var maxZI = 0;
			openedPopups.each(function() {
				var popup = $(this);
				if (popup.attr('data-ignore') === 'true') {
					return;
				}
				var zi = parseInt(popup.css('zIndex'), 10);
				if (isNaN(zi)) {
					zi = 0;
				}
				maxZI = Math.max(maxZI, zi);
			});

			if (maxZI > 0) {
				self.css('zIndex', maxZI + 1);
				DEBUG &&
					console.log(
						'%c--[module popups] added z-index ' + (maxZI + 1) + ', because there was another opened popups',
						'font-style: italic; color: #999'
					);
			}
		}

		// Вычисляем текущую величину прокрутки страницы
		// (делаем это до того, как будут произведены какие-либо дальнейшие действия).
		var scrTop = getScrTop();
		DEBUG && console.log('[module popups] scrTop: ' + scrTop);

		// Если есть fixed элементы на странице,
		// то задаём им padding-right, равный ширине полосы прокрутки.
		// Без этого такие элементы будут дёргаться,
		// так как в процессе открытия всплывашки слегка меняются общие стили страницы.
		if (hasFixedElems) {
			var scrollbarWidth = getScrollbarWidth();
			DEBUG && console.log('[module popups] scrollbarWidth: ' + scrollbarWidth);
			fixedPageElems.css('padding-right', scrollbarWidth + 'px');
		}

		// NOTE: Это из-за плашки browser-update,
		// которая задаёт <html> ненулевой margin-top,
		// (в случае, если плашка об устаревшем браузере показана)
		// из-за которого страница 'прыгает'.
		var mt = parseInt($document.css('marginTop'), 10);
		var mtExists = !isNaN(mt) && mt !== 0;
		if (mtExists) {
			scrTop -= mt;
		}

		// Основная магия происходит здесь.
		// Элементу .l-wrapper задаётся класс, который одновременно
		// убирает полосу прокрутки у <body> (так как .l-wrapper теперь position: absolute),
		// и добавляет полосу прокрутки у самого .l-wrapper (за счёт overflow: auto).
		// После этого остаётся прокрутить элемент .l-wrapper до того же значения,
		// которое было до этого у <body> (мы посчитали эту величину ранее).
		// Происходит это достаточно быстро, чтобы пользователь ничего не заметил.
		$wrapper.addClass(wrapperAbsClass).scrollTop(scrTop);

		// NOTE: Это из-за плашки browser-update
		if (mtExists) {
			$document.scrollTop(0);
		}

		// Это для отсутсвия скролла у <body> в некоторых редких случаях
		// (например, если висит плашка об устаревшем браузере)
		$html.addClass(popupOpenedClass);

		// Здесь предусмотрена возможность автоматически скрывать некоторые всплывашки
		// при открытии других всплывашек.
		// Для этого им нужно задать определённый data- атрибут
		// (указан в локальных переменных в начале модуля).
		var autohidePopupsOpened = autohidePopups.filter('.' + openedClass);
		if (autohidePopupsOpened.length > 0) {
			DEBUG &&
				console.log('[module popups] hided ' + autohidePopupsOpened.length + ' popups with ' + dAttrAutohide + '=true');
			autohidePopups.removeClass(openedClass);
		}

		// Далее, делаем нашу всплывашку видимой (за счёт класса)
		self.addClass(openedClass);

		// Здесь предусмотрена возможность
		// закрыть текущую всплывашку через определённый промежуток времени
		// (например, всплывашка с которким информационным сообщением).
		// Для этого им нужно задать определённый data- атрибут
		// (указан в локальных переменных в начале модуля).
		var hideDelay = self.attr(dAttrHide);
		if (hideDelay) {
			hideDelay = parseInt(hideDelay, 10);
			hideDelay = isNaN(hideDelay) ? hideDelayDefault : hideDelay;
			setTimeout(function() {
				self.trigger(evNameClose);
			}, hideDelay);
		}

		DEBUG &&
			console.log(
				'[module popups] opened popup: ' + (self.attr('id') ? '#' + self.attr('id') : '.' + self.attr('class'))
			);
	};

	/**
	 * Возврат страницы к исходному
	 * (до того, как была открыта хоть одна всплывшка)
	 * состоянию.
	 *
	 * @param  {boolean} force Часть функционала можно исполнить принудительно
	 */
	var clearScrollStyles = function(force) {
		if (force == null) {
			force = false;
		}

		// Функция выполнится, если не осталось открытых всплывашек
		// (потому что их может быть несколько, и закрытие одной не означает закрытие всех),
		// либо принудительно (в редких случаях).
		var hasOpenedPopups = getOpenedPopups().length > 0;
		if (hasOpenedPopups && !force) {
			return;
		}

		// Вычисляем текущую величину прокрутки страницы
		// (функция getScrTop достаточно 'умная', чтобы посчитать текущий скролл при любом состоянии).
		// Это нужно сделать до того, как произойдут дальнейшие действия.
		var scrTop = getScrTop();
		DEBUG &&
			console.log('%c[module popups] (clearScrollStyles) scrTop: ' + scrTop + '. force: ' + force, 'color: #999');

		// Возвращаем структурные элементы .l-wrapper и body
		// к исходному состоянию, убираем все необходимые классы.
		$wrapper.removeClass(wrapperAbsClass);
		$html.removeClass(popupOpenedClass);

		// Если на странице есть fixed элементы,
		// то убираем ранее заданное значение radding-right
		if (hasFixedElems) {
			fixedPageElems.css('padding-right', '');
		}

		// NOTE: Это из-за плашки browser-update
		var mt = parseInt($document.css('marginTop'), 10);
		var mtExists = !isNaN(mt) && mt !== 0;
		if (mtExists) {
			scrTop += mt;
		}

		// Наконец, пролистываем body до того значения,
		// который был у .l-wrapper.
		// Происходит это довольно быстро, так что пользователь не заметит разницы.
		$document.scrollTop(scrTop);
	};

	/**
	 * Все действия, связанные с закрытием всплывашки
	 */
	var popupClose = function() {
		var self = $(this);
		if (!self.hasClass(openedClass)) {
			return;
		}

		self.removeClass(openedClass);

		// Так как вплывашка прилетает не мгновенно, а плавно,
		// то сразу делать возврат страницы к исходному состоянию нельзя
		// (будут видны артефакты, сязанные с переводом полосы прокрутки
		// от body к .l-wrapper и обратно).
		var end = function() {
			setTimeout(function() {
				clearScrollStyles();
			}, 200);
		};

		// Для современных браузеров, где работает свойство transition,
		// вешаем обработчик на событие transitionEnd.
		if (transitionEventEnd) {
			self.one(transitionEventEnd, end);

			// Для старых браузеров, сразу вызываем функцию.
		} else {
			end();
		}

		DEBUG &&
			console.log(
				'[module popups] closed popup: ' + (self.attr('id') ? '#' + self.attr('id') : '.' + self.attr('class'))
			);
	};

	/**
	 * Обработчик события 'click', который определяет,
	 * по какому именно мы кликнули элементу, и, если это
	 * 'пустое пространство' за самой всплывахой,
	 * то закрываем её.
	 *
	 * NOTE: Можно отменить данное действие, задав дополнительный data- атрибут
	 *
	 * @param  {object} e Event
	 */
	var popupClick = function(e) {
		var self = $(this);
		if (e.target === this && self.attr(dAttrBgClose) !== 'false') {
			self.trigger(evNameClose);
		}
	};

	/**
	 * Клик по кнопкам, открывающим всплывахи.
	 * Какую именно всплывашку открыть - обозначено в data- атрибуте.
	 */
	var openPopupBtnClick = function() {
		var self = $(this);
		var selector = self.attr(dAttrSelector);
		var popup = popups.filter(selector);
		popup.trigger(evNameOpen);

		var closePopupSelector = self.attr(dAttrClose);
		if (closePopupSelector) {
			var popupToClose = $(closePopupSelector);
			popupToClose.trigger(evNameClose);
		}
	};

	/**
	 * Клик по кнопкам, закрывающим всплывашку.
	 * Будет закрыта 'родительская' всплывашка
	 * (поиск по ближайшему родителю с нужным классом).
	 */
	var closePopupBtnClick = function() {
		var self = $(this);
		var popup = self.closest('.' + popupClass);
		popup.trigger(evNameClose);
	};

	/**
	 * Так как прокрутку страницы мы 'отменяем' хитрым способом,
	 * то при попытке перезагрузить страницу, на которой уже открыта всплывашка,
	 * нас перекинет наверх страницы.
	 * Это подбешивает, поэтому привязываем данную функцию на событие закрытия (обновления)
	 * страницы. Мы принудительно возвращаем страницу к её исходному состоянию,
	 * тем самым нас не перекинет наверх после перезагрузки.
	 */
	var windowUnload = function() {
		clearScrollStyles(true);
	};

	/**
	 * Обработчик нажатий на кнопки клавиатуры.
	 * Необходим для того, чтобы можно было закрыть всплывашку кнопкой ESC.
	 *
	 * NOTE: Так как возможны случаи, когда открыто несколько всплывах,
	 * то закрываем их одна за одной, начиная с той, у которой наибольший z-index.
	 *
	 * @param  {object} e Event
	 */
	var keyController = function(e) {
		// Обрабатываем только нажатие на ESC,
		// а все остальные нажатия игнорируем.
		if (e.keyCode !== 27) {
			return;
		}

		var openedPopups = getOpenedPopups();
		if (!openedPopups.length) {
			return;
		}
		var maxZI = 0;
		var lastOpenedPopup = undefined;
		openedPopups.each(function() {
			var popup = $(this);
			var zi = parseInt(popup.css('zIndex'), 10);

			if (isNaN(zi)) {
				zi = 0;
			}
			if (zi >= maxZI) {
				maxZI = zi;
				lastOpenedPopup = popup;
			}
		});

		if (!lastOpenedPopup) {
			return;
		}

		// Закрываем только последнюю открытую всплывашку
		lastOpenedPopup.trigger(evNameClose);
	};

	// Привязка событий и функций-обработчиков
	popups.on(evNameOpen, popupOpen);
	popups.on(evNameClose, popupClose);
	openPopupBtns.on('click', openPopupBtnClick);
	closePopupBtns.on('click', closePopupBtnClick);
	popups.on('click', popupClick);
	$window.on('beforeunload', windowUnload);
	$window.on('keyup', keyController);
}

Popups.prototype = {};

module.exports = new Popups();
