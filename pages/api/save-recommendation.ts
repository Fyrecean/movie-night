// pages/api/rsvp.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { ensureDataDirectory, getCurrentWeekNumber, isValidPhoneNumber, readWeekData, writeWeekData } from '@/lib/filing';
import { parse } from 'cookie';

const saveRecommendation = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Retrieve the user's phone number from the cookie
    const cookies = parse(req.headers.cookie || '');
    const phoneNumber = cookies['movie-night-session'];

    if (!isValidPhoneNumber(phoneNumber)[0]) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    const movie = req.body;

    ensureDataDirectory();
    const weekNumber = getCurrentWeekNumber();
    let weekData = await readWeekData(weekNumber, true) || { weekNumber, allowVotes: false, users: [] };

    const userIndex = weekData.users.findIndex(user => user.phoneNumber === phoneNumber);

    if (userIndex !== -1) {
        const movieIndex = weekData.users.findIndex(user => user.movieRecommendation?.id === movie.id);
        if (movieIndex === -1) { // Add recommendation
            weekData.users[userIndex].movieRecommendation = movie;
            weekData.users[userIndex].upvotes = [phoneNumber];
            weekData.users[userIndex].downvotes = [];
        } else { // Add user to upvotes of existing recommendation
            let otherUser = weekData.users[movieIndex];
            if (!otherUser.upvotes) {
                otherUser.upvotes = [];
            }
            if (!otherUser.upvotes.includes(phoneNumber)) {
                otherUser.upvotes.push(phoneNumber);
            }
        }
    }
    const success = await writeWeekData(weekNumber, weekData);


    if (success) {
        res.status(200).json({ message: 'Movie saved successfully' });
    } else {
        res.status(500).json({ error: 'Failed to save movie' });
    }
};

export default saveRecommendation;
