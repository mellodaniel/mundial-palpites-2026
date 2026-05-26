export function calculatePredictionPoints(
    predictedHome: number,
    predictedAway: number,
    actualHome: number,
    actualAway: number
  ) {
    const exactScore =
      predictedHome === actualHome && predictedAway === actualAway;
  
    if (exactScore) {
      return {
        points: 5,
        exactScore: true,
        correctOutcome: true,
      };
    }
  
    const predictedOutcome = getOutcome(predictedHome, predictedAway);
    const actualOutcome = getOutcome(actualHome, actualAway);
  
    let points = 0;
    const correctOutcome = predictedOutcome === actualOutcome;
  
    if (correctOutcome) {
      points += 3;
    }
  
    if (predictedHome === actualHome) {
      points += 1;
    }
  
    if (predictedAway === actualAway) {
      points += 1;
    }
  
    return {
      points,
      exactScore: false,
      correctOutcome,
    };
  }
  
  function getOutcome(home: number, away: number) {
    if (home > away) return 'HOME_WIN';
    if (home < away) return 'AWAY_WIN';
    return 'DRAW';
  }