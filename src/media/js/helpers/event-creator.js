class EventCreator {
	constructor(el, name, payload = {}) {
		this.el = el;
		this.event = this.el.createEvent('CustomEvent');

		this.init(name, payload);
	}

	init(name, payload) {
		this.event.initCustomEvent(name, true, false, payload);
	}

	dispatch() {
		this.el.dispatchEvent(this.event);
	}
}

module.exports = EventCreator;
