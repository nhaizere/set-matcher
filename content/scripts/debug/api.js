var API = {
    calculatePairs: function (data) {
        return AJAX.post('/api/pairs', data);
    }
}