var port = process.env.port || process.env.PORT || 8000;
var path = require('path');
var express = require('express');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var expressLess = require('express-less');
var jsRender = require('jsrender');

var app = express();
app.use(favicon(path.join(__dirname, 'content/favicon.ico')));
app.use(bodyParser.json());
app.use('/content', express.static('content'));
app.use('/content/styles', expressLess(path.join(__dirname, 'content/styles')));

app.get('/debug', function (request, response) {
    var html = loadView('Set Matcher - Debug', 'debug');
    response.send(html);
});

app.get('/', function (request, response) {
    var html = loadView('Set Matcher - Landing', 'landing');
    response.send(html);
});

app.post('/api/:type', function (request, response) {
    var result = { status: true };
    switch (request.params.type) {
        case 'names':
            var names = require(path.join(__dirname, 'scripts/name-generator.js'));
            names(request.body).then(generated => {
                result.result = generated;
                response.setHeader('Content-Type', 'application/json');
                response.status(200);
                response.send(JSON.stringify(result));
            });

            break;
        case 'pairs':
            var pairing = require(path.join(__dirname, 'scripts/api/pairing.js'));
            result.result = pairing(request.body);
            response.setHeader('Content-Type', 'application/json');
            response.status(200);
            response.send(JSON.stringify(result));
            break;
        default:
            response.status(404);
            result.status = false;
            response.setHeader('Content-Type', 'application/json');
            response.send(JSON.stringify(result));
            break;
    }
    
    
});

function loadView(title, viewName, data) {
    var contentTemplate = jsRender.templates('./views/' + viewName + '.html');
    var content = contentTemplate.render(data || {});

    var template = jsRender.templates('./views/shared/template.html');
    var html = template.render({
        title: title || 'Set Matcher',
        content: content
    });

    return html;
}

app.listen(port);