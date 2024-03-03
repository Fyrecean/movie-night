// lib/utils.ts
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { IWeekData } from './types';
const sleep = promisify(setTimeout);


export const isValidPhoneNumber = (phoneNumber: string): [boolean, string] => {
    // Read the users data from the JSON file
  const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
  const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));

  // Check if phoneNumber is a 10-character string of numbers and is contained in usersData
  if (!/^\d{10}$/.test(phoneNumber)) {
    return [false, ""];
  }
  const user = usersData.filter((user: { phone: string }) => user.phone === phoneNumber);
  if (user.length !== 1) {
    return [false, ""];
  }
  return [true, user[0].name];
}

// Return whether the phone number is in weekData.users
export const isUserRSVPed = async (phoneNumber: string) => {
    const weekNumber = getCurrentWeekNumber();
    const weekData = await readWeekData(weekNumber, false) || { weekNumber, users: [] };
    return weekData.users.some(user => user.phoneNumber === phoneNumber);
}

// Return a the current week number, incrementing on mondays since 2/19/2024  (week 1)
export const getCurrentWeekNumber = (): number => {
    const currentDate = new Date();
    const startDate = new Date('2024-02-19');
    const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.floor(daysSinceStart / 7) + 1;
};

// File reading utility
export const readWeekData = async (weekNumber: number, lock: boolean): Promise<IWeekData | null> => {
    const filePath = path.join(process.cwd(), 'data', `week-${weekNumber}.json`);
    const lockFilePath = `${filePath}.lock`;
    try {
        if (lock) {
            // Attempt to create a lock file, retry if it exists
            while (fs.existsSync(lockFilePath)) {
                await sleep(100); // Wait for 0.1 seconds before retrying
            }
            fs.writeFileSync(lockFilePath, ''); // Create an empty lock file
        }
        if (!fs.existsSync(filePath)) {
            const data = { weekNumber: weekNumber, users: []}
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        }
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContents);

        // Basic runtime validation
        if (typeof data === 'object' && data !== null && 'weekNumber' in data && 'users' in data && Array.isArray(data.users)) {
            return data as IWeekData; // Assuming the data is valid if these checks pass
        } else {
            throw new Error('Invalid data structure');
        }
    } catch (error) {
        console.error(`Error reading file for week ${weekNumber}:`, error);
        if (lock && fs.existsSync(lockFilePath)) {
            fs.unlinkSync(lockFilePath);
        }
        return null;
    }
};

// Write to the week-<weekNumber>.json file 
export const writeWeekData = async (weekNumber: number, data: IWeekData): Promise<boolean> => {
    const dirPath = path.join(process.cwd(), 'data');
    const filePath = path.join(dirPath, `week-${weekNumber}.json`);
    const lockFilePath = `${filePath}.lock`;

    try {
        // Proceed with writing to the actual file
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

        return true;
    } catch (error) {
        console.error(`Error writing file for week ${weekNumber}:`, error);
        return false;
    } finally {
        // Ensure the lock file is removed even if an error occurs
        if (fs.existsSync(lockFilePath)) {
            fs.unlinkSync(lockFilePath);
        }
    }
};

// Ensure data directory exists
export const ensureDataDirectory = (): void => {
    const dirPath = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
};
