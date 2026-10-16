export interface DeliveryEstimate {
  hoursLeft: number;
  minutesLeft: number;
  secondsLeft: number;
  countdownString: string;
  deliveryDateString: string;
  isSameDayDispatch: boolean;
  dayName: string;
  fullMessage: string;
}

/**
 * Calculates dynamic delivery date and countdown remaining based on local store hours
 */
export function calculateDeliveryEstimate(
  cutoffHour = 17,
  cutoffMinute = 0,
  transitDays = 2,
  businessDaysOnly = true
): DeliveryEstimate {
  const now = new Date();
  
  // Cutoff timestamp for today
  const todayCutoff = new Date(now);
  todayCutoff.setHours(cutoffHour, cutoffMinute, 0, 0);

  const isPastCutoff = now.getTime() >= todayCutoff.getTime();
  const currentDayOfWeek = now.getDay(); // 0 = Sun, 6 = Sat
  const isWeekend = currentDayOfWeek === 0 || currentDayOfWeek === 6;

  // Next dispatch date calculation
  let dispatchDate = new Date(now);
  let targetCutoff = new Date(todayCutoff);
  let isSameDayDispatch = false;

  if (!isPastCutoff && (!businessDaysOnly || !isWeekend)) {
    // Orders placed right now will dispatch today!
    isSameDayDispatch = true;
    targetCutoff = todayCutoff;
  } else {
    // Orders will dispatch next business day
    isSameDayDispatch = false;
    let daysToAdd = isPastCutoff ? 1 : 0;
    
    dispatchDate.setDate(dispatchDate.getDate() + daysToAdd);
    
    if (businessDaysOnly) {
      while (dispatchDate.getDay() === 0 || dispatchDate.getDay() === 6) {
        dispatchDate.setDate(dispatchDate.getDate() + 1);
      }
    }
    
    targetCutoff = new Date(dispatchDate);
    targetCutoff.setHours(cutoffHour, cutoffMinute, 0, 0);
  }

  // Calculate millisecond difference until target cutoff
  let diffMs = targetCutoff.getTime() - now.getTime();
  if (diffMs < 0) {
    diffMs = 0;
  }

  const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
  const minutesLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const secondsLeft = Math.floor((diffMs % (1000 * 60)) / 1000);

  const countdownParts: string[] = [];
  if (hoursLeft > 0) countdownParts.push(`${hoursLeft}h`);
  countdownParts.push(`${minutesLeft}m`);
  countdownParts.push(`${secondsLeft}s`);
  const countdownString = countdownParts.join(' ');

  // Calculate estimated delivery arrival date from dispatchDate
  let arrivalDate = new Date(isSameDayDispatch ? now : dispatchDate);
  let addedDays = 0;

  while (addedDays < transitDays) {
    arrivalDate.setDate(arrivalDate.getDate() + 1);
    if (businessDaysOnly) {
      const day = arrivalDate.getDay();
      if (day !== 0 && day !== 6) {
        addedDays++;
      }
    } else {
      addedDays++;
    }
  }

  const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' });
  const monthDayFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

  const dayName = weekdayFormatter.format(arrivalDate);
  const deliveryDateString = `${dayName}, ${monthDayFormatter.format(arrivalDate)}`;

  const fullMessage = `Order within ${hoursLeft > 0 ? `${hoursLeft}h ` : ''}${minutesLeft}m to receive by ${dayName}`;

  return {
    hoursLeft,
    minutesLeft,
    secondsLeft,
    countdownString,
    deliveryDateString,
    isSameDayDispatch,
    dayName,
    fullMessage,
  };
}
