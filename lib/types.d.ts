export interface IMovie {
    id: number; // Unique identifier for the movie
    title: string; // Title of the movie
    overview: string; // A brief summary of the movie
    poster_path: string | null; // Path to the movie's poster image (relative to the TMDb image base URL)
    release_date: string; // Release date of the movie (in "YYYY-MM-DD" format)
    vote_count: number; // Average rating of the movie
    genre_ids: number[]
}

// Type definitions for the data structure
export interface IUser {
    phoneNumber: string;
    name: string; // Optional since the user might not have RSVP'd yet
    movieRecommendation?: IMovie;
    upvotes: string[];
    downvotes: string[];
}

export interface IWeekData {
    weekNumber: number;
    users: IUser[];
}

interface IMovieRecommendation {
    movie: IMovie;
    myVote: voteType | null;
    upvotes: number;
    downvotes: number;
}

export interface IReservations {
    users: string[];
    movieRecommendations: IMovieRecommendation[];

}

export type voteType = 'up' | 'down';
export interface IVote {
    movieId: number;
    upOrDown: voteType;
}