// pages/api/rsvp.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { ensureDataDirectory, getCurrentWeekNumber, isValidPhoneNumber, readWeekData, writeWeekData } from '@/lib/filing';
import { parse } from 'cookie';

const rsvp = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Retrieve the user's phone number from the cookie
    const cookies = parse(req.headers.cookie || '');
    const phoneNumber = cookies['movie-night-session'];

    const [valid, name] = isValidPhoneNumber(phoneNumber);

    if (!valid) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    const { rsvpStatus } = req.body;

    ensureDataDirectory();
    const weekNumber = getCurrentWeekNumber();
    let weekData = await readWeekData(weekNumber, true) || { weekNumber, users: [] };

    const userIndex = weekData.users.findIndex(user => user.phoneNumber === phoneNumber);

    if (rsvpStatus && userIndex === -1) {
        // User is attending and not in the list, add them
        weekData.users.push({ phoneNumber: phoneNumber, name: name, upvotes: [], downvotes: []});
    } else if (!rsvpStatus && userIndex > -1) {
        // User is not attending, remove them from the list
        weekData.users.splice(userIndex, 1);
        //Remove any votes for this user
        weekData.users.forEach(user => {
            user.upvotes = user.upvotes.filter(voter => voter !== phoneNumber);
            user.downvotes = user.downvotes.filter(voter => voter !== phoneNumber);
        });
    }

    const success = await writeWeekData(weekNumber, weekData);

    if (success) {
        res.status(200).json({ message: 'RSVP updated successfully' });
    } else {
        res.status(500).json({ error: 'Failed to update RSVP' });
    }
};

export default rsvp;
