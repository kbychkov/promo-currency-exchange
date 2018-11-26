const dom = require('../utils/DOM');

function Connector() {
	console.log("Connector");
}

Connector.prototype = {
	send(address, data, completeHandler, errorHandler) {
		let formData = new FormData();

		for (let i in data) {
			formData.append(i, data[i]);
		}

		$.ajax({
			url: address,
			type: 'POST',
			data: formData,
			dataType: 'json',
			processData: false,
			contentType: false,
			success: function(data) {
				typeof completeHandler === 'function' && completeHandler(data);
			},
			error: function(err) {
				typeof errorHandler === 'function' && errorHandler(err);
			},
		});
	},
};
module.exports = new Connector();
