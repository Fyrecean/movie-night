import { ensureDataDirectory, getCurrentWeekNumber, readWeekData, writeWeekData } from "@/lib/filing";
import { parse } from "cookie";
import { NextApiRequest, NextApiResponse } from "next";
import { promisify } from "util";
const sleep = promisify(setTimeout);

const vote = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    const cookie = parse(req.headers.cookie || '');
    const phoneNumber = cookie['movie-night-session'];
    if (!phoneNumber) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    const { movieId, upOrDown } = req.body;

    ensureDataDirectory();
    const weekNumber = getCurrentWeekNumber();
    let weekData = await readWeekData(weekNumber, true) || { weekNumber, allowVotes: false, users: [] };

    // append phoneNumber to an "upvote" or "downvote" array in the movie recommendation object
    const recommendationIndex = weekData.users
        .findIndex(user => user.movieRecommendation?.id === movieId);
    if (recommendationIndex === -1 || weekData.users[recommendationIndex].movieRecommendation === undefined) {
        return res.status(400).json({ error: 'Movie not found' });
    }
    const user = weekData.users[recommendationIndex];
    if (upOrDown === 'up') {
        if (!user.upvotes) {
            user.upvotes = [];
        }

        user.downvotes = user.downvotes.filter((vote) => vote !== phoneNumber);
        if (user.upvotes.includes(phoneNumber)) {
            user.upvotes = user.upvotes.filter((vote) => vote !== phoneNumber);
        } else {
            user.upvotes.push(phoneNumber);
        }
    } else {
        if (!user.downvotes) {
            user.downvotes = [];
        }

        user.upvotes = user.upvotes.filter((vote) => vote !== phoneNumber);
        if (user.downvotes.includes(phoneNumber)) {
            user.downvotes = user.downvotes.filter((vote) => vote !== phoneNumber);
        } else {
            user.downvotes.push(phoneNumber);
        }
    }
    const success = await writeWeekData(weekNumber, weekData);
    if (success) {
        res.status(200).json({ message: 'Vote saved successfully' });
    } else {
        res.status(500).json({ error: 'Failed to save vote' });
    }
}

export default vote;