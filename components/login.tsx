import { useState, useRef } from "react";

export const Login = (props: {onLogin: (phone: string, name: string) => void}) => {
    const [areaCode, setAreaCode] = useState('');
    const [firstThree, setFirstThree] = useState('');
    const [lastFour, setLastFour] = useState('');

    const areaCodeRef = useRef<HTMLInputElement>(null);
    const firstThreeRef = useRef<HTMLInputElement>(null);
    const lastFourRef = useRef<HTMLInputElement>(null);

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>, setFunction: React.Dispatch<React.SetStateAction<string>>, nextRef?: React.RefObject<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement;
        let value = target.value.replace(/[^0-9]/g, '');
        let extraChar = "";
        if (value.length > target.maxLength - 1) {
            extraChar = target.value[target.maxLength - 1];
            value = value.slice(0, target.maxLength - 1);
        }
        setFunction(value);
        // Move to next field if maxLength is reached and there's a next field
        if (value.length >= target.maxLength - 1 && nextRef?.current) {
            nextRef.current.focus();
            if (extraChar !== "") {
                nextRef.current.value = extraChar; // Set the extra character in the next field
            }
            nextRef.current.setSelectionRange(0, 4);
        }

    };

    const handleBackspace = (event: React.KeyboardEvent<HTMLInputElement>, prevRef?: React.RefObject<HTMLInputElement>) => {
        if (event.key === "Backspace" && event.currentTarget.value.length === 0) {
            event.preventDefault(); // Prevent the default backspace behavior
            if (prevRef?.current) {
                prevRef.current.focus();
                prevRef.current.value = prevRef.current.value.slice(0, -1); // Remove the last character
            }
        }
    };

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>, prevRef: React.RefObject<HTMLInputElement>) => {
        if (!prevRef.current) {
            return;
        }
        if (!prevRef.current?.value || prevRef.current.value.length < prevRef.current.maxLength - 1) {
            prevRef.current.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const phoneNumber = `${areaCode}${firstThree}${lastFour}`;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phoneNumber }),
            });
            const responseData = await response.json(); // Parse response body as JSON
            if (!response.ok) {
                if (responseData && responseData.error) {
                    // If error message exists in the response data, display it
                    alert(responseData.error);
                }
            } else {
                props.onLogin(phoneNumber, responseData.name);
            }

        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <form className="p-6 bg-white rounded shadow-md" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <div className="flex space-x-2">
                        <span className='phoneDecoration'>(</span>
                        <input
                            type="tel"
                            id="areaCode"
                            maxLength={4}
                            required
                            placeholder="123"
                            className="w-1/6 p-2 mt-1 border rounded-md"
                            value={areaCode}
                            onChange={(e) => handleInput(e, setAreaCode, firstThreeRef)}
                            onKeyDown={(e) => handleBackspace(e)}
                            ref={areaCodeRef}
                        />
                        <span className='phoneDecoration'>)</span>
                        <input
                            type="tel"
                            id="firstThree"
                            maxLength={4}
                            required
                            placeholder="456"
                            className="w-1/6 p-2 mt-1 border rounded-md"
                            value={firstThree}
                            onFocus={(e) => handleFocus(e, areaCodeRef)}
                            onChange={(e) => handleInput(e, setFirstThree, lastFourRef)}
                            onKeyDown={(e) => handleBackspace(e, areaCodeRef)}
                            ref={firstThreeRef}
                        />
                        <span className='phoneDecoration'>-</span>
                        <input
                            type="tel"
                            id="lastFour"
                            maxLength={5}
                            required
                            placeholder="7890"
                            className="w-1/3 p-2 mt-1 border rounded-md"
                            value={lastFour}
                            onFocus={(e) => handleFocus(e, firstThreeRef)}
                            onChange={(e) => handleInput(e, setLastFour)}
                            onKeyDown={(e) => handleBackspace(e, firstThreeRef)}
                            ref={lastFourRef}
                        />
                    </div>
                </div>
                <button type="submit" className="w-full p-2 mt-4 text-white bg-blue-500 rounded-md">Log In</button>
            </form>
        </div>
    );
};