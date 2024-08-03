import React, { useState } from 'react';
import './App.css';

function App() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [intermediate, setIntermediate] = useState(['']);
  const [distances, setDistances] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const addIntermediateLocation = () => {
    setIntermediate([...intermediate, '']);
  };

  const deleteIntermediateLocation = (index) => {
    const newIntermediate = [...intermediate];
    newIntermediate.splice(index, 1);
    setIntermediate(newIntermediate);
  };

  const updateIntermediate = (index, value) => {
    const newIntermediate = [...intermediate];
    newIntermediate[index] = value;
    setIntermediate(newIntermediate);
  };

  const updateDistance = (from, to, distance) => {
    setDistances({
      ...distances,
      [`${from}-${to}`]: Number(distance),
      [`${to}-${from}`]: Number(distance), // Assuming distances are symmetric
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const data = {
      start,
      end,
      intermediate: intermediate.filter(loc => loc !== ''),
      distances
    };

    console.log('Submitting data:', data);  // Debug log

    try {
      const response = await fetch('http://localhost:3001/solve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Received result:', result);  // Debug log
      setResult(result);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <h2>F1 Planner</h2>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="Start location"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="End location"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder={`Distance from ${start} to ${end}`}
          onChange={(e) => updateDistance(start, end, e.target.value)}
          required
        />
        {intermediate.map((loc, index) => (
          <div key={index} className="intermediate">
            <input
              type="text"
              placeholder={`Intermediate location ${index + 1}`}
              value={loc}
              onChange={(e) => updateIntermediate(index, e.target.value)}
            />
            <input
              type="number"
              placeholder={`Distance from ${start} to ${loc || 'here'}`}
              onChange={(e) => updateDistance(start, loc, e.target.value)}
            />
            <input
              type="number"
              placeholder={`Distance from ${loc || 'here'} to ${end}`}
              onChange={(e) => updateDistance(loc, end, e.target.value)}
            />
            {intermediate.map((loc2, index2) => (
              index !== index2 && (
                <input
                  key={`${index}-${index2}`}
                  type="number"
                  placeholder={`Distance from ${loc || 'here'} to ${loc2 || 'there'}`}
                  onChange={(e) => updateDistance(loc, loc2, e.target.value)}
                />
              )
            ))}
            <button
              type="button"
              onClick={() => deleteIntermediateLocation(index)}
              className="delete-button"
            >
              Delete
            </button>
          </div>
        ))}
        <button type="button" onClick={addIntermediateLocation} className="add-button">
          Add Intermediate Location
        </button>
        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? 'Calculating...' : 'Calculate Best Route'}
        </button>
      </form>
      {isLoading && <p className="loading">Loading...</p>}
      {error && <p className="error">Error: {error}</p>}
      {result && result.missingDistances && (
        <div className="result error">
          <h3>Missing Distances:</h3>
          <ul>
            {result.missingDistances.map((dist, index) => (
              <li key={index}>{dist}</li>
            ))}
          </ul>
        </div>
      )}
      {result && result.route && (
        <div className="result">
          <h3>Best Route:</h3>
          <p>{result.route.join(' -> ')}</p>
          <h3>Total Distance:</h3>
          <p>{result.distance}</p>
        </div>
      )}
    </div>
  );
}

export default App;
