(function () {
    var members = [];
    var currentMemberId = undefined;
    var currentSelection = [];
    var highlightedRowIds = [];
    var states = {
        idle: 'idle',
        complete: 'complete',
        active: 'active',
        available: 'available',
        choosen: 'choosen'
    };

    var input = document.getElementById('input');
    var randomizeNamesButton = document.getElementById('randomize-names');
    var submitButton = document.getElementById('submit');
    var clearButton = document.getElementById('clear');
    var table = document.getElementById('table');
    var rowTemplate = document.getElementById('row-template');
    var matchButton = document.getElementById('match');
    var clearMatchButton = document.getElementById('clear-match');

    randomizeNamesButton.onclick = function () {
        API.randomizeNames({ count: 20 }).then(response => {
            input.value = response.result.join(', ');
        });
    }

    submitButton.onclick = function() {
        var lastId = members.length === 0 ? 1 : Math.max.apply(null, members.map(m => m.id)) + 1;
        var newMembers = input.value.split(/[,\n]/)
            .map(v => v.trim())
            .filter(v => v.length > 0)
            .map((v, index) => {
                return {
                    id: lastId + index,
                    name: v,
                    references: []
                }
            });

        members = members.concat(newMembers);
        addRows(newMembers);
        updateStates(newMembers);

        input.value = '';
    }

    clearButton.onclick = function() {
        currentMemberId = undefined;
        currentSelection = [];
        members = [];

        var body = table.children[1];
        body.innerHTML = '';
        input.value = '';

        highlightRows(undefined);
    }

    table.onclick = function(event) {
        if (!event.target.findParent(n => n.nodeName === 'TBODY'))
            return;

        var row = event.target.findParent(n => n.nodeName === 'TR');
        if (!row)
            return;

        var rowId = parseInt(row.id.replace('member-row-', ''));
        var member = members.filter(r => r.id === rowId)[0];

        switch (event.target.className) {
        case 'member-name':
            changeName(member);
            break;
        case 'state':
            processState(member);
            updateStates();
            break;
        case 'row-link':
            var targetRowId = event.target.getAttribute('href').replace('#', '');
            highlightRows([row.id, targetRowId]);
            break;
        }
    }

    matchButton.onclick = function() {
        var set = members.map(m => {
            return {
                id: m.id,
                ref: m.references
            };
        });

        var options = {
            mode: 'priority',
            set: set
        };

        API.calculatePairs(options).then(response => {
            var result = response.result;

            result.pairs.forEach(match => {
                var member1 = members.find(m => m.id === match[0]);
                var member2 = members.find(m => m.id === match[1]);
                member1.matchId = member2.id;
                member1.matchRating = match[2];
                member2.matchId = member1.id;
                member2.matchRating = match[2];
            });

            var matchedIdPairs = result.pairs.map(r => [r[0], r[1]]);
            var matchedIds = [].concat.apply([], matchedIdPairs);
            var nonMatchedMembers = members.filter(m => matchedIds.indexOf(m.id) === -1);
            nonMatchedMembers.forEach(m => {
                m.matchId = null;
            });

            highlightRows(undefined);
            members.forEach(updateRow);
        });
    }

    clearMatchButton.onclick = function() {
        members.forEach(member => {
            delete member.matchId;
            delete member.matchRating;

            highlightRows(undefined);
            updateRow(member);
        });
    }

    function addRows(newMembers) {
        var body = table.children[1];
        var rowsHtml = newMembers.reduce((accum, rowData) => accum + getRowHtml(rowData), '');
        body.insertAdjacentHTML('beforeend', rowsHtml);
    }

    function getRowHtml(member) {
        var templateValue = rowTemplate.innerHTML;
        Object.keys(member).forEach((name) => {
            var value = member[name];
            var regex = new RegExp('{' + name + '}', 'g');
            templateValue = templateValue.replace(regex, value);
        });

        return templateValue;
    }

    function updateRow(member) {
        if (typeof member === 'number') {
            var id = parseInt(member);
            member = members.filter(d => d.id === id)[0];
        }

        if (member.matchId !== undefined) {
            var matchedMember = members.find(m => m.id === member.matchId);
            member.match = member.matchId !== null
                ? '<a class="row-link" href="#member-row-' +
                member.matchId +
                '" title="ID: ' +
                member.matchId +
                '">' +
                matchedMember.name +
                ' (Rating: ' +
                member.matchRating +
                ')</a>'
                : 'None';
        } else {
            member.match = '';
        }

        var row = document.getElementById('member-row-' + member.id);
        var html = getRowHtml(member);
        row.insertAdjacentHTML('beforebegin', html);
        row.remove();

        if (member.matchId !== undefined) {
            var newRow = document.getElementById('member-row-' + member.id);
            newRow.className = member.matchId === null ? 'no-match' : 'has-match';
        }
    }

    function changeName(member) {
        var newName = prompt('Enter new name for ID "' + member.id + '":', member.name);
        if (!newName)
            return;

        if (newName.length === 0) {
            alert('Name cannot be empty!');
            return;
        }

        member.name = newName;
        updateRow(member);

        if (member.matchId)
            updateRow(member.matchId);
    }

    function processState(member) {
        if (currentMemberId === undefined) {
            if (member.references.length > 0) {
                if (confirm('Remove all references from ID "' + member.id + '"?'))
                    member.references = [];
            } else {
                currentMemberId = member.id;
            }

            return;
        }

        if (currentMemberId === member.id) {
            member.references = currentSelection;
            currentMemberId = undefined;
            currentSelection = [];

            return;
        }

        var currentIndex = currentSelection.indexOf(member.id);
        if (currentIndex === -1)
            currentSelection.push(member.id);
        else
            currentSelection.splice(currentIndex, 1);
    }

    function updateStates(forMembers) {
        forMembers || (forMembers = members);
        forMembers.forEach(member => {
            if (currentMemberId === undefined) {
                member.state = member.references.length > 0 ? states.complete : states.idle;
                member.selectionIndicator = member.references.length > 0 ? 'X' : '';
            } else if (currentMemberId === member.id) {
                member.state = states.active;
                member.selectionIndicator = currentSelection.length > 0 ? '+' : '-';
            } else {
                var selectionIndex = currentSelection.indexOf(member.id);
                member.state = selectionIndex === -1 ? states.available : states.choosen;
                member.selectionIndicator = selectionIndex === -1 ? '' : selectionIndex + 1;
            }

            updateRow(member);
        });
    }

    function highlightRows(rowIds) {
        if (highlightedRowIds) {
            highlightedRowIds.forEach(id => {
                var previousHighlightedRow = document.getElementById(id);
                if (previousHighlightedRow)
                    toggleNodeClass(previousHighlightedRow, 'highlighted', false);
            });
        }

        if (rowIds) {
            rowIds.forEach(id => {
                var row = document.getElementById(id);
                if (row)
                    toggleNodeClass(row, 'highlighted', true);
            });
        }

        highlightedRowIds = rowIds;
    }

    function toggleNodeClass(node, name, toggle) {
        var classes = node.className.split(' ').map(c => c.trim()).filter(c => c.length > 0);
        if (toggle) {
            if (classes.indexOf(name) === -1)
                classes.push(name);
        } else {
            var nameLowerCase = name.toLowerCase();
            classes = classes.filter(c => c.toLowerCase() !== nameLowerCase);
        }

        node.className = classes.join(' ');
    }
})();