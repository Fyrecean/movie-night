import { IMovie } from "@/lib/types";
import { useDebounce } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Movie } from "./Movie";

interface IMovieSearchProps {
    refreshReservations: () => Promise<void>;
}

export const MovieSearch = ({refreshReservations}: IMovieSearchProps) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<IMovie[]>([]);
    const fetchMovies = async (query: string) => {
        const response = await fetch(`/api/search-movies?query=${encodeURIComponent(query)}`);
        const movies = await response.json() as IMovie[];
        setResults(movies);
    };
    const debouncedSearch = useDebounce(fetchMovies);
    useEffect(() => {
        if (!query) return;
        debouncedSearch(query);
    }, [query,debouncedSearch]);

    const handleSelectMovie = async (movie: IMovie) => {
        const response = await fetch('/api/save-recommendation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(movie),
        });

        // Clear the entry field and results
        setQuery('');
        setResults([]);
        refreshReservations();
    };

    return (
        <div className="h-dvh">
            <h1 className="text-xl font-bold">Suggest a Movie</h1>
            <p className="text-base">Each person can suggest one movie. You can replace your suggestion at any time.</p>
            <input
                type="text"
                placeholder="Search for a movie..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 m-2"
            />
            <ul>
                {query.length > 0 ? results.map((movie) => (
                    <MovieListItem key={movie.id} movie={movie} onSelectMovie={handleSelectMovie} />
                )): null}
            </ul>
        </div>
    );
};

const MovieListItem = (props: { movie: IMovie, onSelectMovie: (movie: IMovie) => Promise<void>}) => {
    const {movie, onSelectMovie} = props;
    // Ensure movie data is available before rendering
    if (!movie.title) return null;
  
    // Handle clicking on the movie item
    const handleClick = () => {
      onSelectMovie(movie);
    };
    
    return (
      <li key={movie.id} onClick={handleClick} style={{ cursor: 'pointer', display: 'flex'}}>
        <Movie movie={movie} isSearch/>
      </li>
    );
};