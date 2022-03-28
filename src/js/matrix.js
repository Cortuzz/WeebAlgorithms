class Matrix {
    static trans(A)
    {
        let m = A.length, n = A[0].length, AT = [ ];

        for (let i = 0; i < n; i++) {
            AT[i] = [ ];
            for (let j = 0; j < m; j++) {
                AT[i][j] = A[j][i];
            }
        }
        return AT;
    }

    static sum(A, B)
    {
        let m = A.length, n = A[0].length, C = [ ];

        for (let i = 0; i < m; i++) {
            C[i] = [ ];
            for (let j = 0; j < n; j++) {
                C[i][j] = A[i][j] + B[i][j];
            }
        }
        return C;
    }

    static multiplyNumber(a, A)
    {
        let m = A.length, n = A[0].length, B = [ ] ;

        for (let i = 0; i < m; i++) {
            B[i] = [ ];
            for (let j = 0; j < n; j++) {
                B[i][j] = a * A[i][j];
            }
        }
        return B;
    }

    static multiply(A, B)
    {
        let rowsA = A.length, colsA = A[0].length,
            rowsB = B.length, colsB = B[0].length,
            C = [ ];

        if (colsA !== rowsB) {
            throw "Columns of A matrix must be equals Rows of B matrix";
        }

        for (let i = 0; i < rowsA; i++) {
            C[i] = [ ];
        }

        for (let k = 0; k < colsB; k++) {
            for (let i = 0; i < rowsA; i++) {
                let t = 0;
                for (let j = 0; j < rowsB; j++) {
                    t += A[i][j] * B[j][k];
                }
                C[i][k] = t;
            }
        }
        return C;
    }
}
