import { IMovie, IMovieRecommendation, IReservations, IVote, voteType } from "@/lib/types";
import { useEffect, useState } from "react";
import { Movie } from "./Movie";

interface IReservationsProps {
    refreshReservations: () => Promise<void>;
    rsvped: boolean;
    allowVotes: boolean;
    attendeeNames: string[];
    recommendations: IMovieRecommendation[];
}

export const Reservations = ({ refreshReservations, rsvped, allowVotes, attendeeNames, recommendations }: IReservationsProps) => {
    const handleVote = async (movieId: number, upOrDown: voteType) => {
        if (!rsvped) return;
        const response = await fetch('/api/vote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ movieId: movieId, upOrDown: upOrDown } as IVote),
        });
        if (response.ok) {
            refreshReservations();
        }
    };
    const attendeesList = attendeeNames.map((attendee, i) => (
        <li key={i}>{attendee}</li>
    ));
    // return a list of attendees, then a table of movie recommendations where the first column is the movie poster, the second column is the move title, and the 3rd column is a button

    const areMoviesRecommended = recommendations.length > 0;
    const highestVotes = Math.max(...recommendations.map(recommendation => recommendation.upvotes - recommendation.downvotes), 1);
    const movieListTitle = rsvped && allowVotes ? "Vote on this Week's Suggested Movies" : "This Week's Suggested Movies";
    const attendeesTitle = "This Week's Attendees";
    return (
        <div>
            <h1 className="text-xl font-bold ">{attendeesTitle}</h1>
            <ul>
                {attendeeNames.length === 0 ? <li>No attendees yet</li> : attendeesList}
            </ul>
            {areMoviesRecommended ? <>
                <h1 className="text-xl font-bold">{movieListTitle}</h1>
                {rsvped && !allowVotes ? 
                    <p className="text-base .italic">Voting on which movie we will watch will open Monday morning!</p>
                : null}
                {recommendations.map((recommendation, i) => (
                    <Movie key={recommendation.movie.id} movie={recommendation.movie} winner={allowVotes && recommendation.upvotes - recommendation.downvotes >= highestVotes}>
                        {allowVotes ? <div className="flex flex-row">
                            <VoteButton
                                disabled={!rsvped}
                                type='up'
                                count={recommendation.upvotes}
                                highlight={recommendation.myVote === 'up'}
                                onClick={() => handleVote(recommendation.movie.id, 'up')} />
                            <VoteButton
                                disabled={!rsvped}
                                type='down'
                                count={recommendation.downvotes}
                                highlight={recommendation.myVote === 'down'}
                                onClick={() => handleVote(recommendation.movie.id, 'down')} />
                        </div> : null}
                    </Movie>
                ))}
            </>
                : null
            }
        </div>
    );
};

interface IVoteButtonProps {
    disabled: boolean,
    type: voteType;
    count: number;
    highlight: boolean;
    onClick: () => Promise<void>;
}

const VoteButton = ({ disabled, type, count, highlight, onClick }: IVoteButtonProps) => {
    const svgPath = type === 'up' ?
        "M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z"
        :
        "M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384";

    const color = type === 'up' ? "text-green-600" : "text-red-600";
    const basecolor = highlight ? color : "";

    const hover = !disabled ? ` hover:scale-105 hover:${color} hover:shadow` : "";

    const classes = `${basecolor} ${hover} py-1.5 px-3 text-center border border-gray-300 rounded-md border-gray-400 h-8 text-sm flex items-center gap-1 lg:gap-2`;

    return (
        <button disabled={disabled} className={classes} onClick={onClick} >
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={svgPath}></path>
            </svg>
            <span>{count}</span>
        </button>
    );
}
