export function calculateEndTime(startTime: string, durationInMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes + durationInMinutes);
  
    const endHours = date.getHours().toString().padStart(2, '0');
    const endMinutes = date.getMinutes().toString().padStart(2, '0');
  
    return `${endHours}:${endMinutes}`;
  }
  