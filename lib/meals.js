export const DEFAULT_MEALS = [
  { day: 'Monday',    breakfast: 'Oats with berries & almonds',        lunch: 'Grilled chicken salad + quinoa',  dinner: 'Salmon + steamed broccoli + rice',     snack: 'Greek yogurt + apple' },
  { day: 'Tuesday',   breakfast: 'Avocado toast + poached egg',        lunch: 'Lentil soup + wholegrain bread',  dinner: 'Stir-fry tofu + brown rice',           snack: 'Apple + almond butter' },
  { day: 'Wednesday', breakfast: 'Smoothie bowl + granola',            lunch: 'Turkey & hummus wrap',            dinner: 'Baked cod + roasted vegetables',        snack: 'Hummus + carrot sticks' },
  { day: 'Thursday',  breakfast: 'Scrambled eggs + whole wheat toast', lunch: 'Quinoa grain bowl + feta',        dinner: 'Chicken curry + basmati rice',          snack: 'Mixed nuts' },
  { day: 'Friday',    breakfast: 'Chia pudding + mango',               lunch: 'Caesar salad + grilled chicken',  dinner: 'Beef stir-fry + noodles',               snack: 'Banana + peanut butter' },
  { day: 'Saturday',  breakfast: 'Whole wheat pancakes + berries',     lunch: 'Veggie Buddha bowl',              dinner: 'Grilled shrimp + couscous + salad',     snack: 'Cottage cheese + cucumber' },
  { day: 'Sunday',    breakfast: 'Yogurt parfait + honey + nuts',      lunch: 'Tuna salad sandwich',             dinner: 'Roast chicken + sweet potato + greens', snack: 'Fruit salad' },
]

export const MEAL_TIMES = {
  breakfast: '8:00 AM',
  lunch: '1:00 PM',
  snack: '4:00 PM',
  dinner: '7:30 PM',
}

export function getMealsForWeek(weekOffset = 0) {
  return DEFAULT_MEALS.map((day, i) => ({
    ...day,
    breakfast: DEFAULT_MEALS[(i + weekOffset) % 7].breakfast,
    lunch:     DEFAULT_MEALS[(i + weekOffset * 2) % 7].lunch,
    dinner:    DEFAULT_MEALS[(i + weekOffset) % 7].dinner,
    snack:     DEFAULT_MEALS[(i + weekOffset * 3) % 7].snack,
  }))
}

export function getTodaysMeals() {
  const dayIndex = (new Date().getDay() + 6) % 7
  return DEFAULT_MEALS[dayIndex]
}
