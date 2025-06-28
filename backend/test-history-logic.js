// Test logic for streak history generation
console.log('Testing streak history generation logic...\n');
console.log('Current date and time:', new Date());
console.log('Current date (local):', new Date().toLocaleDateString());
console.log('Current day:', new Date().toLocaleDateString('en-US', { weekday: 'long' }));

// Simulate the logic from backend
function generateStreakHistory() {
  const today = new Date();
  console.log('\nBackend today object:', today);
  const history = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Get local date string without timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    console.log(`Backend day ${6-i+1}: i=${i}, date=${date}, dateStr=${dateStr}`);
    
    history.push({
      date: dateStr, // YYYY-MM-DD format
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      completed: i % 2 === 0, // Predictable pattern for testing
      isToday: i === 0
    });
  }
  
  return history;
}

// Simulate frontend logic
function getLast7Days() {
  const today = new Date();
  console.log('\nFrontend today object:', today);
  const days = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Get local date string without timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    console.log(`Frontend day ${6-i+1}: i=${i}, date=${date}, dateStr=${dateStr}`);
    
    days.push({
      date: dateStr,
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      isToday: i === 0 // Last iteration is today
    });
  }
  
  return days;
}

// Test both logics
console.log('Backend streak history:');
const backendHistory = generateStreakHistory();
backendHistory.forEach((day, index) => {
  console.log(`${index + 1}. ${day.dayName} (${day.date}) - Completed: ${day.completed}, IsToday: ${day.isToday}`);
});

console.log('\nFrontend last 7 days:');
const frontendDays = getLast7Days();
frontendDays.forEach((day, index) => {
  console.log(`${index + 1}. ${day.dayName} (${day.date}) - IsToday: ${day.isToday}`);
});

console.log('\nVerifying dates match:');
const datesMatch = backendHistory.every((backendDay, index) => {
  const frontendDay = frontendDays[index];
  return backendDay.date === frontendDay.date && 
         backendDay.dayName === frontendDay.dayName && 
         backendDay.isToday === frontendDay.isToday;
});

console.log('All dates match:', datesMatch);
