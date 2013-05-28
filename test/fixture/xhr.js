window.XMLHttpRequest = function () {};

window.XMLHttpRequest.prototype = {
	open: function () {
    console.log('open');
	},
	send: function () {
    console.log('send');
		// send
	}
};