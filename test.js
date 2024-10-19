const fs = require('fs');

// Decode value from a given base
function decodeValue(base, value) {
    return parseInt(value, parseInt(base));
}

// Lagrange interpolation to find the polynomial value at x
function lagrangeInterpolation(xValues, yValues, x) {
    let totalSum = 0;
    const numPoints = xValues.length;

    for (let i = 0; i < numPoints; i++) {
        const x_i = xValues[i];
        const y_i = yValues[i];
        let term = y_i;

        for (let j = 0; j < numPoints; j++) {
            if (j !== i) {
                term *= (x - xValues[j]) / (x_i - xValues[j]);
            }
        }
        totalSum += term;
    }

    return totalSum;
}

// Check for positive integer coefficients and their size
function validateCoefficients(xValues, yValues) {
    const MAX_256_BIT_NUMBER = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");

    for (let i = 0; i < xValues.length; i++) {
        if (xValues[i] <= 0 || yValues[i] <= 0) {
            throw new Error(`Coefficient a_${i} must be a positive integer.`);
        }

        if (BigInt(yValues[i]) > MAX_256_BIT_NUMBER) {
            throw new Error(`Coefficient a_${i} exceeds the maximum allowed 256-bit number.`);
        }
    }
}

// Find the constant term c from the polynomial defined by the given roots
function findConstantTerm(data) {
    const n = data.keys.n;
    const k = data.keys.k;

    // Check that n is at least k
    if (n < k) {
        throw new Error(`The number of roots provided (n = ${n}) must be greater than or equal to k (k = ${k}).`);
    }

    const xValues = [];
    const yValues = [];

    for (const key in data) {
        if (key === "keys") continue;
        const base = data[key].base;
        const value = data[key].value;
        const x = parseInt(key);
        const y = decodeValue(base, value);

        xValues.push(x);
        yValues.push(y);
    }

    if (xValues.length < k || yValues.length < k) {
        throw new Error("Not enough data points to determine the polynomial.");
    }

    // Validate coefficients
    validateCoefficients(xValues, yValues);

    // Calculate the constant term c at x = 0
    return lagrangeInterpolation(xValues.slice(0, k), yValues.slice(0, k), 0);
}

// Main function to read JSON input and compute the constant term
function main() {
    // Reading the inputs from the JSON file
    fs.readFile('testCases.json', 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading the file:", err);
            return;
        }

        const jsonData = JSON.parse(data);
        jsonData.testCases.forEach((testCase, index) => {
            try {
                const constantTerm = findConstantTerm(testCase);
                console.log(`Constant term for test case ${index + 1}: ${constantTerm}`);
            } catch (error) {
                console.error(`Error processing test case ${index + 1}: ${error.message}`);
            }
        });
    });
}

main();
