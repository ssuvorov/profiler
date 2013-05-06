var http = (function () {
  var win = window;

  var createXhr = (function () {
    if (win.XMLHttpRequest) {
      return function () {
        return new win.XMLHttpRequest();
      };
    } else {
      var ActiveXObj = win.ActiveXObject;
      return function () {
        try { return new ActiveXObj('Microsoft.XMLHTTP'); } catch(e) {}
        try { return new ActiveXObj('Msxml2.XMLHTTP.6.0'); } catch(e) {}
        try { return new ActiveXObj('Msxml2.XMLHTTP.3.0'); } catch(e) {}
        try { return new ActiveXObj('Msxml2.XMLHTTP'); } catch(e) {}
        return null;
      };
    }
  }());


  var sendRequest = function (params) {
    var xhr = createXhr();

    xhr.onload = function () {
      if (xhr.status === 200) {
        params.success(xhr.response);
      }
    };

    xhr.onerror = function (err) {
        params.error(err);
    };

    xhr.open(params.method, params.url, true);

    xhr.send(JSON.stringify(params.data));

    return xhr;
  };


  return {
    post: function (url, data, success, error) {
      return sendRequest({
        method: 'post',
        url: url,
        data: data,
        success: function (response) {
          if (success) {
            success.call(window, response);
          }
        },
        error: function (err) {
          if (error) {
            error(err);
          }
        }
      });
    }
  };
}());