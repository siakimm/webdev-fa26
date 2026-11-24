const cafes = ['Coffee in the West Village', 'Matcha in SoHo', 'Bagels in the East Village', 'Hot chocolate in Chelsea'];
const activities = ['Walk through Central Park', 'Browse a museum', 'Explore a bookstore', 'Take photos in Chinatown', 'Visit a weekend market'];
const foodStops = ['Pizza in the Lower East Side', 'Dumplings in Chinatown', 'Pasta in Little Italy', 'Tacos in the East Village', 'Ramen in Midtown', 'Dessert in Koreatown'];
const neighborhoods = ['Downtown', 'Midtown', 'Uptown'];

function pickRandom(list) {
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const cafe = pickRandom(cafes);
const activity = pickRandom(activities);
const food = pickRandom(foodStops);
const area = pickRandom(neighborhoods);
const extraStops = randomBetween(1, 3);
const subwayRides = randomBetween(2, 5);

const cafeCost = randomBetween(5, 12);
const activityCost = randomBetween(0, 20);
const foodCost = randomBetween(12, 28);
const subwayCostPerRide = 3;
const subwayCost = subwayRides * subwayCostPerRide;
const totalCost = cafeCost + activityCost + foodCost + subwayCost;
const budgetLimit = 45;

const isOverBudget = totalCost > budgetLimit;
const hasManyStops = extraStops >= 3;

let budgetMessage;
if (totalCost <= 35) {
  budgetMessage = 'Budget-friendly day!';
} else if (totalCost <= budgetLimit) {
  budgetMessage = 'A fun day that stays within your $45 budget.';
} else {
  budgetMessage = 'This day goes over your $45 budget.';
}

const pace = hasManyStops ? 'busy' : 'relaxed';
const budgetLabel = isOverBudget ? 'Over budget' : 'Within budget';

const summary = `Start with ${cafe.toLowerCase()}, then ${activity.toLowerCase()}, and finish with ${food.toLowerCase()}.`;

const stops = [cafe, activity, food];
for (let i = 0; i < extraStops; i++) {
  stops.push(`Bonus stop ${i + 1}: wander around ${area}`);
}

let stopsHTML = '';
for (let i = 0; i < stops.length; i++) {
  const itemClass = i % 2 === 0 ? 'even-stop' : 'odd-stop';
  stopsHTML += `<li class="${itemClass}">Stop ${i + 1}: ${stops[i]}</li>`;
}

document.querySelector('#day-type').textContent = `${pace} day · ${budgetLabel}`;
document.querySelector('#day-title').textContent = `Your ${area} NYC day`;
document.querySelector('#summary').textContent = summary;
document.querySelector('#stops').innerHTML = stopsHTML;
document.querySelector('#cost-breakdown').textContent = `Coffee $${cafeCost.toFixed(2)} + activity $${activityCost.toFixed(2)} + food $${foodCost.toFixed(2)} + subway $${subwayCost.toFixed(2)}`;
document.querySelector('#total-cost').textContent = `Estimated total: $${totalCost.toFixed(2)}`;
document.querySelector('#budget-message').textContent = budgetMessage;
document.querySelector('#tip').textContent = `Plan includes ${subwayRides} subway rides and ${extraStops} bonus stop${extraStops === 1 ? '' : 's'}. Estimates are for this class exercise, not real-time prices.`;