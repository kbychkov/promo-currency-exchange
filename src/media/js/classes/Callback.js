// Callback is equal to Signal

function Callback() {
	this._handlers = [];

	const self = this;
	this.callShim = function() {
		self.call.apply(self, arguments);
	};
}

Callback.prototype = {
	_throwError: function() {
		throw new TypeError('Callback handler must be function!');
	},

	add: function(handler, context) {
		if (typeof handler !== 'function') {
			this._throwError();
			return;
		}

		this._handlers.push({ handler: handler, context: context });

		return handler;
	},

	remove: function(handler) {
		if (typeof handler !== 'function') {
			this._throwError();
			return;
		}

		const totalHandlers = this._handlers.length;
		for (let k = 0; k < totalHandlers; k++) {
			if (handler === this._handlers[k].handler) {
				this._handlers.splice(k, 1);
				return handler;
			}
		}
	},

	call: function() {
		const totalHandlers = this._handlers.length;
		for (let k = 0; k < totalHandlers; k++) {
			const handlerData = this._handlers[k];
			handlerData.handler.apply(handlerData.context || null, arguments);
		}
	},

	delayedCall: function(delay) {
		const self = this;
		delay = delay || 100;

		const args = Array.prototype.slice.call(arguments);
		args.shift();

		setTimeout(function() {
			self.call.apply(self, args);
		}, delay);
	},
};

module.exports = Callback;
