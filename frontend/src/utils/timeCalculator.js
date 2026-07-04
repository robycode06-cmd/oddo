export const calculateHours = (checkIn, checkOut, standardHours = 8) => {
  if (!checkIn || !checkOut) return { workHours: '-', extraHours: '-' };

  const inTime = new Date(`1970-01-01T${checkIn}:00Z`);
  const outTime = new Date(`1970-01-01T${checkOut}:00Z`);

  const diffMs = outTime - inTime;
  if (diffMs < 0) return { workHours: 'Error', extraHours: '-' };

  const totalHours = diffMs / (1000 * 60 * 60);
  
  const formatTime = (decimalHours) => {
    if (decimalHours <= 0) return '00:00';
    const hrs = Math.floor(decimalHours);
    const mins = Math.round((decimalHours - hrs) * 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const workHrs = Math.min(totalHours, standardHours);
  const extraHrs = totalHours > standardHours ? totalHours - standardHours : 0;

  return {
    workHours: formatTime(workHrs),
    extraHours: formatTime(extraHrs)
  };
};
