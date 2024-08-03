const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

function checkAllDistances(locations, distances) {
    const missingDistances = [];
    for (let i = 0; i < locations.length; i++) {
        for (let j = i + 1; j < locations.length; j++) {
            const key1 = `${locations[i]}-${locations[j]}`;
            const key2 = `${locations[j]}-${locations[i]}`;
            if (distances[key1] === undefined || distances[key2] === undefined) {
                missingDistances.push(key1);
            }
        }
    }
    return missingDistances;
}

function calculateTotalDistance(route, distances) {
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
        const key = `${route[i]}-${route[i + 1]}`;
        totalDistance += distances[key];
    }
    return totalDistance;
}

function solveTSP(start, end, intermediate, distances) {
    const allLocations = [start, ...intermediate, end];
    const missingDistances = checkAllDistances(allLocations, distances);
    if (missingDistances.length > 0) {
        console.log(`Missing distances for: ${missingDistances.join(', ')}`);
        return { route: null, distance: Infinity, missingDistances };
    }

    let bestRoute = null;
    let bestDistance = Infinity;

    function permute(arr, m = []) {
        if (arr.length === 0) {
            const currentRoute = [start, ...m, end];
            const currentDistance = calculateTotalDistance(currentRoute, distances);
            if (currentDistance < bestDistance) {
                bestDistance = currentDistance;
                bestRoute = currentRoute;
            }
        } else {
            for (let i = 0; i < arr.length; i++) {
                let curr = arr.slice();
                let next = curr.splice(i, 1);
                permute(curr.slice(), m.concat(next));
            }
        }
    }

    permute(intermediate);
    return { route: bestRoute, distance: bestDistance };
}

app.post('/solve', (req, res) => {
    console.log('Received request:', req.body);  // Debug log
    const { start, end, intermediate, distances } = req.body;
    const result = solveTSP(start, end, intermediate, distances);
    console.log('Sending response:', result);  // Debug log
    res.json(result);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
