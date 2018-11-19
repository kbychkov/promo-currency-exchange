function SVGSprites() {
	this.$container = $('<div style="width:0;height:0;overflow:hidden"></div>').prependTo(document.body);

	$.get('media/svg/sprite.svg', data => {
		this.$container.append(
			typeof XMLSerializer !== 'undefined'
				? new XMLSerializer().serializeToString(data.documentElement)
				: $(data.documentElement).html()
		);
	});
}

SVGSprites.prototype = {
	addToContainer: function(html) {
		return $(html).appendTo(this.$container);
	},
};

module.exports = new SVGSprites();
