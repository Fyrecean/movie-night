// api endpoint that responds with the rspvs from data/week-<weekNumber>.json, all the users in one list and all the movie recommendations in another list

import { getCurrentWeekNumber, isValidPhoneNumber, readWeekData } from "@/lib/filing";
import { IMovieRecommendation, IReservations } from "@/lib/types";
import { parse } from "cookie";
import { NextApiRequest, NextApiResponse } from "next";

const loadReservations = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Retrieve the user's phone number from the cookie
    const cookies = parse(req.headers.cookie || '');
    const phoneNumber = cookies['movie-night-session'];

    if (!isValidPhoneNumber(phoneNumber)) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    const weekNumber = getCurrentWeekNumber();
    const weekData = await readWeekData(weekNumber, false) || {
        weekNumber,
        users: []
    };
    const responseData: IReservations = {
        users: [],
        movieRecommendations: [],
    }

    weekData.users.forEach(user => {
        responseData.users.push(user.name);
        if (user.movieRecommendation) {
            const rec: IMovieRecommendation = {
                movie: user.movieRecommendation,
                myVote: user.upvotes.includes(phoneNumber) ? 'up' : user.downvotes.includes(phoneNumber) ? 'down' : null,
                upvotes: user.upvotes.length,
                downvotes: user.downvotes.length,
            }
            responseData.movieRecommendations.push(rec);
        }
    });

    responseData.movieRecommendations.sort((a, b) => {
        if (a.upvotes - a.downvotes > b.upvotes - b.downvotes) {
            return -1;
        } else if (a.upvotes - a.downvotes < b.upvotes - b.downvotes) {
            return 1;
        } else {
            return 0;
        } 
    });
    
    res.status(200).json(responseData);
}

export default loadReservations;