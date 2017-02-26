var API = {
    randomizeNames: function (options) {
        return AJAX.post('/api/names', options);
    },

    calculatePairs: function (options) {
        return AJAX.post('/api/pairs', options);
    }
}