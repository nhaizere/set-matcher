module.exports = function (options) {
    var ratingLevels = [];
    var matches = options.set.map(current => {
        var matchedRatings = current.ref.map((referenceId, index) => {
            var reference = options.set.find(o => o.id === referenceId);
            if (!reference) {
                return {
                    level: -1
                }
            }

            var referenceIndex = reference.ref.indexOf(current.id);
            var level = referenceIndex === -1 ? -1 : index + referenceIndex;
            if (level !== -1 && ratingLevels.indexOf(level) === -1)
                ratingLevels.push(level);

            return {
                referenceId: referenceId,
                level: level
            }
        }).filter(r => r.level !== -1);

        return {
            id: current.id,
            ratings: matchedRatings
        }
    }).filter(m => m.ratings.length > 0);

    var maxLevel = Math.max.apply(null, ratingLevels);
    var lastLevel = maxLevel + 1;
    ratingLevels.sort().push(lastLevel);

    var pairs = [];
    var matchedIds = [];
    var finalPairing = [];
    ratingLevels.forEach(level => {
        var forLevel = matches.filter(m => m.ratings.find(r => r.level <= level));
        forLevel.forEach(match => {
            var pairResults = match.ratings.map(rating => {
                var referencedMatch = matches.find(m => m.id === rating.referenceId);
                var referenceOtherMatches = referencedMatch.ratings
                    .filter(r => r.referenceId !== match.id)
                    .map(r => matches.find(m => m.id == r.referenceId));

                var willBreakPairIds = [];
                var negations = referenceOtherMatches.map(omatch => {
                    if (omatch.ratings.length === 1)
                        willBreakPairIds.push(omatch.id);

                    var worstRatingLevels = omatch.ratings.filter(r => r.level > rating.level).map(r => r.level);
                    if (worstRatingLevels.length === 0)
                        return 0;

                    var minWorstRating = Math.min.apply(null, worstRatingLevels);
                    return minWorstRating - rating.level;
                });

                var totalNegation = negations.reduce((a, b) => a + b, 0);
                return {
                    pairId: rating.referenceId,
                    level: rating.level,
                    totalNegation: totalNegation,
                    willBreakPairIds: willBreakPairIds
                }
            });

            if (level !== lastLevel) {
                pairResults = pairResults.filter(p => p.willBreakPairIds.length === 0);

                if (pairResults.length === 0)
                    return;

                var allNegations = pairResults.map(p => p.totalNegation);
                var minimalNegation = Math.min.apply(null, allNegations);
                var minimalNegationPair = pairResults.find(p => p.totalNegation === minimalNegation);

                pairs.push([match.id, minimalNegationPair.pairId, minimalNegationPair.level]);
                matchedIds.push(match.id);
                matchedIds.push(minimalNegationPair.pairId);
            } else {
                pairResults = pairResults.filter(p => p.willBreakPairIds.length > 0).forEach(p => p.totalNegation *= 2);
                finalPairing = finalPairing.concat(pairResults);
            }
        });

        matches = matches.filter(m => matchedIds.indexOf(m.id) === -1);
        matches.forEach(m => m.ratings = m.ratings.filter(r => matchedIds.indexOf(r.referenceId) === -1));
    });

    if (finalPairing.length > 0) {

    }

    return { pairs };
};