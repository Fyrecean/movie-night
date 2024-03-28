import React, { StrictMode, useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { useDebounce } from '@/lib/utils';
import { IMovie, IMovieRecommendation, IReservations } from '@/lib/types';

import "../app/globals.css";
import { Login } from '@/components/login';
import { MovieSearch } from '@/components/movieSearch';
import { RSVP } from '@/components/rsvp';
import { Reservations } from '@/components/reservations';

const Home = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [name, setName] = useState('');
    const [rsvped, setRsvped] = useState(false);
    const [allowVotes, setAllowVotes] = useState(false);

    const [attendeeNames, setAttendeeNames] = useState<string[]>([]);
    const [recommendations, setRecommendations] = useState<IMovieRecommendation[]>([]);

    const fetchReservations = async () => {
        const response = await fetch('/api/load-reservations');
        const data = await response.json() as IReservations;
        setAttendeeNames(data.users);
        setRecommendations(data.movieRecommendations);
    };

    useEffect(() => {
        // Retrieve phone number from cookies when component mounts
        const phoneNumber = Cookies.get('movie-night-session');
        if (phoneNumber) {
            fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phoneNumber }),
            })
            .then(response => {
                if (!response.ok) {
                    return Promise.reject();
                }
                return response.json()
            })
            .then(data =>{
                fetchReservations();
                setPhoneNumber(phoneNumber);
                setName(data.name);
                setRsvped(data.isRsvped);
                setAllowVotes(data.allowVotes);
            });
        };
    }, [name]);

    const handleLogin = (name: string, phone: string) => {
        setName(name);
        setPhoneNumber(phone);
    }

    const handleRSVP = async (isAttending: boolean) => {
        setRsvped(isAttending);
        fetchReservations();
    }

    const handleToggleVote = async () => {
        fetch('/api/toggle-votes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (!response.ok) {
                return Promise.reject();
            }
            return response.json()
        })
        .then(data =>{
            fetchReservations();
            setPhoneNumber(phoneNumber);
            setName(data.name);
            setRsvped(data.isRsvped);
            setAllowVotes(data.allowVotes);
        });
    }

    return (
        <div className="container mx-auto">
            {!phoneNumber ? <Login onLogin={handleLogin}/> :
                <div>
                    <h1 className="text-xl font-bold">Welcome, {name}, to Carter&apos;s Movie Night Reservationinator!</h1>
<p className="text-base">Doors open April 1st at 6:30pm, movie starts at 7:00!</p>
<p className="text-base .italic">Address: 6922 East Pass Apt 204</p>
                    <RSVP rsvped={rsvped} onRSVP={handleRSVP}>
                        {phoneNumber === "1234567890" ? 
                            <button className="px-4 py-2 hover:scale-105 hover:shadow text-center border border-blue-300 rounded-md border-gray-400 h-8 text-sm flex items-center gap-2 lg:gap-2" onClick={handleToggleVote}>Toggle Vote</button> 
                            : null}
                    </RSVP>
                    <Reservations
                        refreshReservations={fetchReservations} 
                        allowVotes={allowVotes}
                        attendeeNames={attendeeNames}
                        recommendations={recommendations} 
                        rsvped={rsvped}/>
                    {rsvped ? <MovieSearch refreshReservations={fetchReservations} /> : null}
                </div>
            }
        </div>
    );
};

export default Home;

