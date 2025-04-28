/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

const TravelPlanningApp = () => {
  const [budget, setBudget] = useState('');
  const [people, setPeople] = useState('');
  const [prediction, setPrediction] = useState('');
  const [destinationImage, setDestinationImage] = useState('');
  const [budgetError, setBudgetError] = useState('');
  const [peopleError, setPeopleError] = useState('');

  const handlePredict = () => {
    setBudgetError('');
    setPeopleError('');

    if (!budget || isNaN(budget)) {
      setBudgetError('Please enter a valid budget.');
      return;
    }

    if (!people || isNaN(people)) {
      setPeopleError('Please enter a valid number of people.');
      return;
    }

    const destinations = [
      { name: 'Sigiriya', image: 'https://via.placeholder.com/400x200?text=Sigiriya' },
      { name: 'Ella', image: 'https://via.placeholder.com/400x200?text=Ella' },
      { name: 'Kandy', image: 'https://via.placeholder.com/400x200?text=Kandy' },
      { name: 'Jaffna', image: 'https://via.placeholder.com/400x200?text=Jaffna' },
      { name: 'Polonnaruwa', image: 'https://via.placeholder.com/400x200?text=Polonnaruwa' },
    ];
    const activities = ['Sightseeing', 'Hiking', 'Beach Relaxation', 'Cultural Tour'];

    const randomDestination = destinations[Math.floor(Math.random() * destinations.length)];

    let randomActivity;
    if (randomDestination.name === 'Polonnaruwa') {
      randomActivity = 'Cultural Tour';
    } else {
      randomActivity = activities[Math.floor(Math.random() * activities.length)];
    }

    setPrediction(`Recommended: ${randomActivity} in ${randomDestination.name}`);
    setDestinationImage(randomDestination.image);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Activity & Destination Predictor</h1>
      <div style={styles.centerContainer}>
        <div style={styles.card}>
          <p style={styles.description}>
            Enter your trip details to get a recommended activity and destination.
          </p>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Trip Budget ($):</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              style={styles.input}
              placeholder="Enter your budget"
            />
            {budgetError && <p style={styles.error}>{budgetError}</p>}
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Number of People:</label>
            <input
              type="number"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              style={styles.input}
              placeholder="Enter number of people"
            />
            {peopleError && <p style={styles.error}>{peopleError}</p>}
          </div>
          <button style={styles.button} onClick={handlePredict}>
            Predict Activity & Destination
          </button>
          {prediction && (
            <div style={styles.predictionContainer}>
              <p style={styles.prediction}>{prediction}</p>
              {destinationImage && (
                <img
                  src={destinationImage}
                  alt="Destination"
                  style={styles.destinationImage}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '20px',
    fontSize: '2rem',
    fontWeight: 'bold',
  },
  centerContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  description: {
    textAlign: 'center',
    color: '#555',
    marginBottom: '20px',
  },
  inputGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    color: '#333',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  button: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '12px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    width: '100%',
    marginTop: '10px',
    transition: 'background-color 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  predictionContainer: {
    marginTop: '20px',
    textAlign: 'center',
  },
  prediction: {
    color: '#28a745',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    marginBottom: '10px',
  },
  destinationImage: {
    width: '100%',
    borderRadius: '8px',
    marginTop: '10px',
  },
  error: {
    color: '#dc3545',
    fontSize: '0.875rem',
    marginTop: '5px',
  },
};

export default TravelPlanningApp;