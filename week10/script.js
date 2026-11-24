const cafes = ['Matcha in SoHo', 'Coffee in Chelsea', 'Cafe in West Village']
const activities = ['Visit a museum', 'Explore a bookstore', 'Go shopping', 'Walk through a park']
const foods = ['Dumplings in Chinatown', 'Pizza in Brooklyn', 'Pasta in Little Italy']
const extras = ['Visit a record store', 'Explore a new neighborhood', 'Get dessert', 'Visit a gallery']

function pickRandom(list) {
  const index = Math.floor(Math.random() * list.length)
  return list[index]
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

let budget = 45
let bonusStops = 1
let day = []

function generateDay() {
  day = [
    pickRandom(cafes),
    pickRandom(activities),
    pickRandom(foods)
  ]

  for (let i = 0; i < bonusStops; i++) {
    day.push(pickRandom(extras))
  }

  render()
}

function render() {
  const coffeeCost = randomBetween(5, 10)
  const activityCost = randomBetween(0, 15)
  const foodCost = randomBetween(12, 20)
  const extraCost = bonusStops * 5

  const total = coffeeCost + activityCost + foodCost + extraCost

  const withinBudget = total <= budget
  const busyDay = day.length > 4

  let message

  if (withinBudget && !busyDay) {
    message = 'A relaxing day within your budget!'
  } else if (withinBudget) {
    message = 'A busy day within your budget!'
  } else {
    message = 'This day is over your budget.'
  }

  const pace = busyDay ? 'Busy Day' : 'Relaxed Day'

  document.querySelector('#day-type').textContent = pace
  document.querySelector('#day-title').textContent = 'Your NYC Day'
  document.querySelector('#summary').textContent = `You have ${day.length} stops planned.`

  let stopList = ''

  for (let i = 0; i < day.length; i++) {
    const type = i % 2 === 0 ? 'even' : 'odd'
    stopList += `<li class="${type}">Stop ${i + 1}: ${day[i]}</li>`
  }

  document.querySelector('#stops').innerHTML = stopList

  document.querySelector('#cost-breakdown').textContent =
    `Coffee: $${coffeeCost.toFixed(2)} | Activity: $${activityCost.toFixed(2)} | Food: $${foodCost.toFixed(2)} | Extras: $${extraCost.toFixed(2)}`

  document.querySelector('#total-cost').textContent = `Estimated Total: $${total.toFixed(2)}`
  document.querySelector('#budget-message').textContent = message
  document.querySelector('#tip').textContent = 'Have fun exploring NYC!'

  document.querySelector('#bonus-count').textContent = bonusStops

  document.querySelector('#minus-btn').disabled = bonusStops === 0
  document.querySelector('#plus-btn').disabled = bonusStops === 5
}

document.querySelector('#generate-btn').addEventListener('click', generateDay)

document.querySelector('#plus-btn').addEventListener('click', function() {
  if (bonusStops < 5) {
    bonusStops++
    generateDay()
  }
})

document.querySelector('#minus-btn').addEventListener('click', function() {
  if (bonusStops > 0) {
    bonusStops--
    generateDay()
  }
})

document.querySelector('#budget-input').addEventListener('input', function() {
  budget = Number(this.value)
  render()
})

generateDay()
