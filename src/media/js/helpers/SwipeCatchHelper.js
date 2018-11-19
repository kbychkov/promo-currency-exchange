const utils = require('../utils/Utils');
const dom = require('../utils/DOM');

var UP = 'up';
var DOWN = 'down';
var LEFT = 'left';
var RIGHT = 'right';

function SwipeCatchHelper() {}

SwipeCatchHelper.prototype = {
	watch: function($element, handler, preventDefaults, useMouse, watchBothDirections = false) {
		var xDistance = 50;
		var yDistance = 50;
		var swipeTime = 500;

		var touching = false;
		var startX = 0;
		var startY = 0;
		var startTime = 0;

		var directionX = 0;
		var directionY = 0;
		var prevDx = 0;
		var prevDy = 0;

		var skipX = false;
		var skipY = false;

		var startEvents = 'touchstart' + (useMouse ? ' mousedown' : '');
		var moveEvents = 'touchmove' + (useMouse ? ' mousemove' : '');
		var releaseEvents = 'touchend blur resize' + (useMouse ? ' mouseup' : '');

		// console.log('>>  ' + useMouse)

		$element.on(startEvents, function(e) {
			preventDefaults && e.preventDefault();
			preventDefaults && e.stopPropagation();

			touching = true;

			if (e.touches && e.touches.length) {
				var touch = e.touches[0];

				startX = touch.screenX;
				startY = touch.screenY;
			} else {
				startX = e.clientX;
				startY = e.clientY;
			}

			startTime = utils.now();

			skipX = false;
			skipY = false;
		});

		dom.$window
			.on(moveEvents, function(e) {
				if (touching) {
					preventDefaults && e.preventDefault();
					preventDefaults && e.stopPropagation();

					var x;
					var y;

					if (e.touches && e.touches.length) {
						var touch = e.touches[0];

						x = touch.screenX;
						y = touch.screenY;
					} else {
						x = e.clientX;
						y = e.clientY;
					}

					//var touch = e.touches[0];
					var dx = x - startX;
					var dy = y - startY;

					var currentDirectionX = dx > prevDx ? 1 : -1;
					var currentDirectionY = dy > prevDy ? 1 : -1;

					if (preventDefaults) {
						if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
							e.preventDefault();
						}
					}

					if (directionX != 0) {
						if (directionX != currentDirectionX) {
							startX = x;
							dx = 0;
						}
					}

					directionX = currentDirectionX;

					if (directionY != 0) {
						if (directionY != currentDirectionY) {
							startY = y;
							dy = 0;
						}
					}

					directionY = currentDirectionY;

					prevDx = dx;
					prevDy = dy;

					var now = utils.now();
					if (now - startTime < swipeTime) {
						// NOTE: Такая сложная конструкция нужна для того, чтобы избежать
						// непредвиденного закрытия меню при свайпе по диагонали.
						// Такое возникает иногда спонтанно при свайпах пользователя вверх/вниз,
						// при этом есть горизонтальная составляющая свайпа, из-за которой закрывается меню,
						// а пользователь думает, что за хня :)
						if (watchBothDirections) {
							if (!skipX && !skipY) {
								let tolerance = 4;
								if (Math.abs(dx) > Math.abs(dy) + tolerance) {
									handler(dx > 0 ? RIGHT : LEFT);
									skipX = true;
								} else {
									handler(dy > 0 ? DOWN : UP);
									skipY = true;
								}
							}
						} else {
							if (!skipX) {
								if (Math.abs(dx) > xDistance) {
									handler(dx > 0 ? RIGHT : LEFT);
									skipX = true;
								}
							}

							if (!skipY) {
								if (Math.abs(dy) > yDistance) {
									handler(dy > 0 ? DOWN : UP);
									skipY = true;
								}
							}
						}
					}
				}
			})
			.on(releaseEvents, function(e) {
				touching = false;
				directionX = 0;
				directionY = 0;
				prevDx = 0;
				prevDy = 0;
			});
	},

	/*watchStop: function($element) {
		$element.off('touchstart');
		dom.$window.off('touchmove');
	}*/
};

var instance = new SwipeCatchHelper();
instance.UP = UP;
instance.DOWN = DOWN;
instance.LEFT = LEFT;
instance.RIGHT = RIGHT;

module.exports = instance;
