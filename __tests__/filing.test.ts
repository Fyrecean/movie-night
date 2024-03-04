import { getWeekNumber } from '../lib/filing';

describe('getWeekNumber', () => {
  it('should return 1 for dates and times before 2024-02-26 at 8pm', () => {
    const date1 = new Date('2024-02-26T19:59:59');
    expect(getWeekNumber(date1)).toBe(1);

    const date2 = new Date('2024-02-26T00:00:00');
    expect(getWeekNumber(date2)).toBe(1);

    // Add more test cases for dates and times before 2024-02-26 at 8pm
  });

  it('should return 2 for dates and times immediately after 2024-02-26 at 8pm', () => {
    const date1 = new Date('2024-02-26T20:00:00');
    expect(getWeekNumber(date1)).toBe(2);

    const date2 = new Date('2024-02-27T00:00:01');
    expect(getWeekNumber(date2)).toBe(2);

    // Add more test cases for dates and times immediately after 2024-02-26 at 8pm
  });
//   it('right now is week 2', () => {
//     const date1 = new Date('2024-03-04T20:00:00');
//     expect(getWeekNumber(date1)).toBe(2);
//   });
});