import { useState } from "react";

interface IRSVPProps {
    rsvped: boolean;
    onRSVP: (isAttending: boolean) => void;
    children?: React.ReactNode;
}

export const RSVP = ({rsvped, onRSVP, children}: IRSVPProps) => {
    const [hasResponded, setHasResponded] = useState(rsvped);
    const handleRSVP = async (isAttending: boolean) => {
        setHasResponded(true);
        const response = await fetch('/api/rsvp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rsvpStatus: isAttending }),
        });

        if (!response.ok) {
            alert('Failed to update RSVP');
        }
        onRSVP(isAttending);
    };

    return <>
    {hasResponded ? 
        <div className="flex flex-row gap-4">
            {rsvped ? <p className="text-green-400">Attending</p> : <p>Catch you next time!</p>}
            <button
                className="px-4 py-2 hover:scale-105 hover:shadow text-center border border-red-300 rounded-md border-gray-400 h-8 text-sm flex items-center gap-2 lg:gap-2"
                onClick={() => {
                    if (!rsvped || window.confirm('Are you sure you want to cancel your RSVP?\nThis will remove your recommended movie and votes.')) {
                        handleRSVP(false);
                        setHasResponded(false);
                    }
                }}
                >
                X NeverMind
            </button>
            {children}
        </div>
        : 
        <div className="flex space-x-4">
            <button
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={() => handleRSVP(true)}
            >
                Attending
            </button>
            <button
                className="px-4 py-2 bg-red-500 text-white rounded"
                onClick={() => handleRSVP(false)}
            >
                Not Attending
            </button>
            {children}
        </div>
        }
    </>;
}