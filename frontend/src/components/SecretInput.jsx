// src/components/SecretInput.jsx
import React from 'react';

const SecretInput = ({ secretNumber, setSecretNumber, onSecretSubmit }) => {
    const handleInputChange = (index, value) => {
        // Allow backspace to clear the input
        if (value === '') {
            const newSecret = [...secretNumber];
            newSecret[index] = value;
            setSecretNumber(newSecret);
            return;
        }

        // Original validation for single digit and numeric value
        if (value.length > 1 || !/^\d*$/.test(value)) return;

        const newSecret = [...secretNumber];

        // Check if the new value already exists in the current secret
        if (newSecret.includes(value)) return;

        // Check if the first digit is '0'
        if (index === 0 && value === '0') return;

        newSecret[index] = value;
        setSecretNumber(newSecret);

        // Automatically focus the next input if the current one is filled
        if (value && index < 3) {
            document.getElementById(`secret-input-${index + 1}`).focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !secretNumber[index] && index > 0) {
            document.getElementById(`secret-input-${index - 1}`).focus();
        }
    };

    return (
        <div className="flex space-x-2 items-center">
            {secretNumber.map((digit, index) => (
                <input
                    key={index}
                    id={`secret-input-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-12 text-center text-2xl border-2 border-gray-300 rounded"
                    maxLength="1"
                />
            ))}
            <button
                onClick={onSecretSubmit}
                disabled={secretNumber.some(digit => digit === '')}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
            >
                Set Secret
            </button>
        </div>
    );
};

export default SecretInput;