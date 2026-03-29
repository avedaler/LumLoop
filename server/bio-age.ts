export function calculateBioAge(
  chronologicalAge: number,
  metrics: { sleepHours?: number; hrv?: number; restingHR?: number; steps?: number; bodyFat?: number; weight?: number },
  biomarkers: { cortisol?: number; vitaminD?: number; hsCRP?: number; hba1c?: number },
  adherence: number
): { bioAge: number; cardioAge: number; sleepAge: number; metabolicAge: number; immuneAge: number; muscleAge: number } {

  // Sleep subsystem
  let sleepAge = chronologicalAge;
  if (metrics.sleepHours) {
    if (metrics.sleepHours >= 7 && metrics.sleepHours <= 9) sleepAge -= 2;
    else if (metrics.sleepHours < 6) sleepAge += 3;
  }

  // Cardio subsystem
  let cardioAge = chronologicalAge;
  if (metrics.hrv) {
    if (metrics.hrv > 60) cardioAge -= 3;
    else if (metrics.hrv > 40) cardioAge -= 1;
    else cardioAge += 2;
  }
  if (metrics.restingHR) {
    if (metrics.restingHR < 60) cardioAge -= 2;
    else if (metrics.restingHR > 80) cardioAge += 2;
  }

  // Metabolic subsystem
  let metabolicAge = chronologicalAge;
  if (biomarkers.hba1c) {
    if (biomarkers.hba1c < 5.4) metabolicAge -= 2;
    else if (biomarkers.hba1c > 6.0) metabolicAge += 3;
  }
  if (metrics.bodyFat) {
    if (metrics.bodyFat < 20) metabolicAge -= 1;
    else if (metrics.bodyFat > 30) metabolicAge += 2;
  }

  // Immune subsystem
  let immuneAge = chronologicalAge;
  if (biomarkers.hsCRP) {
    if (biomarkers.hsCRP < 1.0) immuneAge -= 3;
    else if (biomarkers.hsCRP > 3.0) immuneAge += 3;
  }
  if (biomarkers.vitaminD) {
    if (biomarkers.vitaminD > 40) immuneAge -= 2;
    else if (biomarkers.vitaminD < 20) immuneAge += 2;
  }

  // Muscle subsystem
  let muscleAge = chronologicalAge;
  if (metrics.steps) {
    if (metrics.steps > 10000) muscleAge -= 2;
    else if (metrics.steps < 4000) muscleAge += 2;
  }

  // Composite
  let bioAge = (sleepAge + cardioAge + metabolicAge + immuneAge + muscleAge) / 5;

  // Adherence bonus
  if (adherence > 80) bioAge -= 1;

  const round1 = (n: number) => Math.round(n * 10) / 10;
  return {
    bioAge: round1(bioAge),
    cardioAge: round1(cardioAge),
    sleepAge: round1(sleepAge),
    metabolicAge: round1(metabolicAge),
    immuneAge: round1(immuneAge),
    muscleAge: round1(muscleAge),
  };
}
