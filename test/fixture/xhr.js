window.XMLHttpRequest = function () {
  this.readyState = 0; // UNSENT
};

window.XMLHttpRequest.instances = [];
window.XMLHttpRequest.fixture = true;

window.XMLHttpRequest.prototype = {
	open: function (method, url, async) {
    if (this.readyState !== 0) {
      throw new Error("Repeated open");
    }

    this.readyState = 1; //OPENED
    this.method = method;
    this.url = url;
    this.async = async;

    window.XMLHttpRequest.instances.push(this);
	},

	send: function () {
    console.log('send');
		// send
	}
};