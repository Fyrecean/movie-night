import { IMovie } from "@/lib/types";
import { Children } from 'react';

interface MovieProps {
    movie: IMovie;
    isSearch?: boolean;
    children?: React.ReactNode;
}

export const Movie = ({ children, movie, isSearch }: MovieProps) => {
    const hover = isSearch ? 'hover:bg-gray-800' : '';
    const classes = `flex flex-row gap-4 w-full ${hover}`;
    return (<div className={classes}>
        <div>
            <img src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`} alt={movie.title} style={{ width: '75px', height: 'auto' }} />
        </div>
        <div className="movieTitle">
            <h3 className="text-l font-bold">{movie.title}</h3>
            <p>({new Date(movie.release_date).getFullYear()})</p>
            {children}
        </div>
    </div>);
}
