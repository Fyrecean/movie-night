// pages/api/search-movies.ts

import { isValidPhoneNumber } from '@/lib/filing';
import { IMovie } from '@/lib/types';
import { parse } from 'cookie';
import type { NextApiRequest, NextApiResponse } from 'next';

const TMDB_API_KEY = "5214fb5def4b1a9c2282c6aad7b83ebb";//process.env.TMDB_API_KEY; // Ensure you have this in your .env.local file

const searchMovies = async (req: NextApiRequest, res: NextApiResponse) => {
    const { query } = req.query;

    // Retrieve the user's phone number from the cookie
    const cookies = parse(req.headers.cookie || '');
    const phoneNumber = cookies['movie-night-session'];
    if (!isValidPhoneNumber(phoneNumber)[0]) {
        return res.status(400).json({ error: `Invalid phone number or user not found: ${phoneNumber}` });
    }

    if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: 'Query is required' });
    }

    try {
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`);
        const data = await response.json();

        if (data.results) {
            const filteredResults = (data.results as IMovie[]).filter(movie => {
                return movie.vote_count > 100;
            });
            res.status(200).json(filteredResults);
        } else {
            res.status(404).json({ message: 'Movies not found' });
        }
    } catch (error) {
        console.error('Movie search error:', error);
        res.status(500).json({ message: 'Error searching for movies' });
    }
};

export default searchMovies;
