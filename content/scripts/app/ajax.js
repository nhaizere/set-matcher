var AJAX = {
    request: function (method, url, data) {
        method || (method = 'POST');
        method = method.toUpperCase();

        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url, true);
            xhr.setRequestHeader('Content-type', 'application/json', true);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    var data = JSON.parse(xhr.response);
                    resolve(data);
                }
                else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            }

            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };

            var json = data ? JSON.stringify(data) : null;
            xhr.send(json);
        });
    },

    get: function(url, data) {
        return this.request('GET', url, data);
    },

    post: function (url, data) {
        return this.request('POST', url, data);
    },

    put: function (url, data) {
        return this.request('PUT', url, data);
    }
};