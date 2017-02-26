module.exports = [
    {
        name: 'Triangle problem',
        data: [
            { id: 1, references: [4, 5, 2] },
            { id: 2, references: [1, 3] },
            { id: 3, references: [2] }
        ],
        expectedPairs: [
            [2, 3]
        ]
    },
    {
        name: 'Square problem',
        data: [
            { id: 1, references: [2, 3] },
            { id: 2, references: [4, 1] },
            { id: 3, references: [1, 4] },
            { id: 4, references: [5, 2, 3] }
        ],
        expectedPairs: [
            [1, 3],
            [2, 4],
        ]
    },
    {
        name: 'Separation problem',
        data: [
            { id: 1, references: [2, 4] },
            { id: 2, references: [1, 3] },
            { id: 3, references: [2] },
            { id: 4, references: [1, 5] },
            { id: 5, references: [6, 4] },
            { id: 6, references: [5] }
        ],
        expectedPairs: [
            [1, 4],
            [2, 3],
            [5, 6],
        ]
    }
];
