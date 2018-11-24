const Flatpickr = require('flatpickr');
import { Russian } from "flatpickr/dist/l10n/ru.js"

const dom = require('../utils/DOM');
const env = require('../utils/ENV');

function DateTime() {
	console.log(typeof Flatpickr);

	// TODO: Это как-то надо привязать к бэку. Подумать, обсудить, сделать.
	this.holidays = [1543006800000, 1543093200000, 1543611600000, 1543698000000, 1544216400000, 1544302800000, 1544821200000, 1544907600000, 1545426000000, 1545512400000];

	// TEMP
	let $el = dom.$body.find('.form__multiple-inputs');
	$el.each((index, elem) => {
		this.initDateTimePicker(elem);
	});
	// let $clone = $el.clone(false);
	// $el.after($clone);

	// this.initDateTimePicker('.js-datetime');
	// this.initDateTimePicker($clone);
}

DateTime.prototype = {
	fnDatePickerDefaults() {
		Flatpickr.localize(Flatpickr.l10ns.ru);
	},
	// TODO: Пока что не работает на мобилке.
	initDateTimePicker(el, options) {
		var winWidth = window.innerWidth;
		var $dateTime = $(el);
		options = options || {};
		let self = this;

		if (!$dateTime.length) return;

		if ($dateTime.length > 1) {
			$dateTime.each(function () {
				self.initDateTimePicker(this, options);
			});
			return;
		}

		// $dateTime.html('' +
		// 	'<div class="form__input _date"><input type="text" placeholder="Выберете дату" class="js-call-date" data-input></div>' +
		// 	'<div class="form__input _time js-call-time"></div>' +
		// 	'<input type="hidden" name="schedule-start"><input type="hidden" name="schedule-end">' +
		// 	'<input type="hidden" name="schedule-timezone-offset">' +
		// 	'<div class="datetime__dropdown">' +
		// 	'<div class="datetime__dropdown-col _calendar"></div>' +
		// 	'<div class="datetime__dropdown-col">' +
		// 	'<div class="datetime__schedule"></div>' +
		// 	'<div class="datetime__mobile-schedule">' +
		// 	'<select name="datetime-select"></select>' +
		// 	'</div></div></div>');

		$dateTime.find('[name="date"]').addClass('_date js-call-date').attr('data-input', '');
		$dateTime.find('[name="time"]').addClass('_time js-call-time');

		let $newMarkupElem = $('<div></div>');
		$newMarkupElem.html(`
			<input type="hidden" name="schedule-start">
			<input type="hidden" name="schedule-end">
			<input type="hidden" name="schedule-timezone-offset">

			<div class="datetime__dropdown">
			<div class="datetime__dropdown-col _calendar"></div>
			<div class="datetime__dropdown-col">
			<div class="datetime__schedule"></div>
			<div class="datetime__mobile-schedule">

			<select name="datetime-select"></select>
		`);
		$dateTime.append($newMarkupElem);

		var $select = $dateTime.find('.datetime__mobile-schedule select');
		var $dateTimeInput = $dateTime.find('.form__input');
		var $dropdown = $dateTime.find('.datetime__dropdown');
		var $schedule = $dateTime.find('.datetime__schedule');
		var $scheduleIntervalInput = $dateTime.find('._time');
		var $scheduleIntervalStart = $dateTime.find('[name="schedule-start"]');
		var $scheduleIntervalEnd = $dateTime.find('[name="schedule-end"]');
		var $timeZoneOffset = $dateTime.find('[name="schedule-timezone-offset"]');

		var date = new Date();
		var defaultDate = new Date(date);
		defaultDate.setHours(0);
		defaultDate.setMinutes(0);
		defaultDate.setSeconds(0);
		defaultDate.setMilliseconds(0);
		var activeDate = defaultDate;
		var $activeSchedule;
		var saveInterval = function (d) {
			// NOTE: Какая-то хня в оригинальном модуле. Добавлял сразу два врмени, при инициализации.
			if ($dateTime.find('._selected').length > 1) {
				$dateTime.find('._selected').removeClass('_selected').last().addClass('_selected');
			}
			$activeSchedule = $dateTime.find('._selected').text();
			// $scheduleIntervalInput.html($activeSchedule);
			console.log("$activeSchedule: " + $activeSchedule);
			$scheduleIntervalInput.val($activeSchedule);

			var parts = $activeSchedule.split('-'),
				first = parts[0],
				second = parts[1];

			$scheduleIntervalStart.val(
			  (d.getTime()
				+ (+first.split(':')[0] * 60
				  + +first.split(':')[1]) * 60000) / 1000
			);

			$scheduleIntervalEnd.val(
			  (d.getTime()
				+ (+second.split(':')[0] * 60
				  + +second.split(':')[1]) * 60000) / 1000
			);
		};

		var now = date.getHours() * 60 + date.getMinutes();
		var scheduleInterval = options.interval || 30;
		var scheduleStart = options.start || (9 * 60);
		var scheduleEnd = options.end || (18 * 60 + 30);
		// ближайший для записи интервал - следующий от текущего
		var disableInterval = Math.floor((now - scheduleStart) / scheduleInterval);
		var MONTHES = 'января,февраля,марта,апреля,мая,июня,июля,августа,сентября,октября,ноября,декабря'.split(',');
		let holidays = this.holidays;

		var equalDates = function (first, second) {
			return (first.getDate() === second.getDate()) &&
				(first.getMonth() === second.getMonth()) &&
				(first.getFullYear() == second.getFullYear());
		};

		var passHolidays = function () {
			return holidays.filter(function (item) {
				if (equalDates(new Date(item), defaultDate)) {
					defaultDate.setDate(defaultDate.getDate() + 1);
					return true;
				}

				return false;
			}).length;
		};

		var checkInterval = function () {
			var setFirstInterval = function () {
				$scheduleCell.eq(0).addClass('_selected');
				$select.val($options.eq(0).val());
			};

			if (scheduleStart <= now && now <= scheduleEnd)  {
				$scheduleCell.slice(0, disableInterval).addClass('_disabled');
				$scheduleCell.eq(disableInterval).addClass('_selected');

				$options.slice(0, disableInterval).attr('disabled', true).hide();
				$select.val($options.eq(disableInterval).val());
			} else {
				if (now >= scheduleEnd) {
					defaultDate.setDate(defaultDate.getDate() + 1);
				}

				if (!holidays.length) {
					if (defaultDate.getDay() === 6) {
						defaultDate.setDate(defaultDate.getDate() + 2);
					} else if (defaultDate.getDay() === 0) {
						defaultDate.setDate(defaultDate.getDate() + 1);
					}
				}

				console.log("setFirstInterval1");
				setFirstInterval();
			}

			if (holidays.length && passHolidays()) {
				console.log("setFirstInterval2", holidays.length, passHolidays());
				setFirstInterval();
			}
		};

		var minutes = function (m) {
			return Math.floor(m / 60)
				+ ':' + ('0' + m % 60).slice(-2);
		};
		// добавление интервалов в разметку
		for (var i = scheduleStart; i < scheduleEnd; i += scheduleInterval) {
			$schedule.append('<span class="datetime__schedule-cell">'
				+ minutes(i) + '-' + minutes(i + scheduleInterval)
				+ '</span>');
			// адаптив
			$select.append('<option><span>'
				+ minutes(i) + '-' + minutes(i + scheduleInterval)
				+ '</span></option>');
		}
		var $scheduleCell = $dateTime.find('.datetime__schedule-cell');
		var $options = $select.find('option');

		// $select.rightSelect();

		// добавление календаря
		checkInterval();
		var fp = $dateTime.flatpickr({
			// locale: 'ru', // TODO
			locale: Russian,
			wrap: true,
			appendTo: $dateTime.find('._calendar')[0],
			inline: true,
			defaultDate: defaultDate,
			minDate: defaultDate,
			maxDate: defaultDate.fp_incr(30),
			disable: [
				function (d) {
					if (holidays.length) {
						return holidays.filter(function (item) {
							return equalDates(d, new Date(item));
						}).length;
					} else {
						return (d.getDay() === 6 || d.getDay() === 0);
					}
				}
			],
			formatDate: function (d, f) {
				console.log("formatDate", d, "---", f);
				if (winWidth <= 480) {
					return ('0' + d.getDate()).slice(-2)
						+ '.' + ('0' + (d.getMonth() + 1)).slice(-2)
						+ '.' + d.getFullYear();
				} else {
					return d.getDate()
						+ '\xA0' + MONTHES[d.getMonth()]
						+ '\xA0' + d.getFullYear();
				}
			},
			onChange: function (selectedDates) {
				activeDate = selectedDates[0];
				console.log("selectedDates", selectedDates);
				if (activeDate.toDateString() === defaultDate.toDateString()) {
					$scheduleCell.removeClass('_selected');
					checkInterval();
				} else {
					$scheduleCell.removeClass('_disabled');
					$options.attr('disabled', false).show();
				}
				saveInterval(activeDate);
			}
		});

		// развешивание _selected по клику
		$scheduleCell.click(function () {
			var $this = $(this);

			$scheduleCell.removeClass('_selected');
			$this.addClass('_selected');
			$select.val($options.eq($scheduleCell.index($this)).val());
			saveInterval(activeDate);
		});

		$select.change(function () {
			$scheduleCell
				.removeClass('_selected')
				.eq($options.index($select.find('option:selected')))
				.addClass('_selected');
			saveInterval(activeDate);
			$dropdown.removeClass('_opened');
		});

		saveInterval(defaultDate);

		$timeZoneOffset.val(
			date.getTimezoneOffset()
		);

		$(window).on('resize', function () {
			winWidth = window.innerWidth;
			fp.setDate(activeDate);
		});

		// появление/скрытие выпадашки
		$('body').click(function () {
			$dropdown.removeClass('_opened');
		});

		$dateTime.click(function (e) {
			var target = $(e.target);

			e.stopPropagation();

			if (winWidth <= 480) {
				if (target.is($dateTimeInput) && $dropdown.hasClass('_opened')) {
					$dropdown.removeClass('_opened');
				} else if(!target.is($select)){
					$dropdown.addClass('_opened');
				}
			} else if (target.is($scheduleCell)) {
				$dropdown.removeClass('_opened');
			} else if (!target.is($select)) {
				$dropdown.addClass('_opened');
			}
		});

		$dateTimeInput.on('mouseenter', function (e) {
			if (winWidth > 480) {
				$(e.currentTarget).addClass('_bordered');
				$dateTime.addClass('_bordered');
			}
		}).on('mouseleave', function () {
			$dateTimeInput.removeClass('_bordered');
			$dateTime.removeClass('_bordered');
		});
	},
};

module.exports = new DateTime();
