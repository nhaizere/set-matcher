module.exports = function () {
    var results = testCases.map(test => {
        var result = calculateMatches(test.data);
        var isPassed = result.every(p => test.expectedPairs.some(e => (e[0] === p[0] && e[1] === p[1]) ||
            (e[0] === p[1] && e[1] === p[0])));

        if (isPassed)
            console.info('Test "' + test.name + '" has been passed successfully.');
        else {
            var expected = test.expectedPairs.map(p => (p + '').replace(',', '+')).join(', ');
            var got = result.map(r => r[0] + '+' + r[1]).join(', ');
            console.warn('Test "' + test.name + '" has been failed. \nExpected pairs: [' + expected + ']\nGot: [' + got + ']');
        }

        return isPassed;
    });

    var isAllPassed = results.every(r => r);
    if (isAllPassed)
        console.info('All test has been passed successfully.');
    else {
        var isAllFailed = results.every(r => !r);
        var consoleMethod = isAllFailed ? 'error' : 'warn';
        console[consoleMethod]((isAllFailed ? 'All' : 'Some') + ' tests has been failed. Algorithm need an improvement.');
    }
}