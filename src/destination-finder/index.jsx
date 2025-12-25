import React, { useState } from 'react';
import PreferenceQuiz from './PreferenceQuiz';
import DestinationResults from './DestinationResults';

export default function DestinationFinder() {
    const [preferences, setPreferences] = useState(null);

    const handleQuizComplete = (prefs) => {
        setPreferences(prefs);
    };

    return (
        <>
            {!preferences ? (
                <PreferenceQuiz onComplete={handleQuizComplete} />
            ) : (
                <DestinationResults preferences={preferences} />
            )}
        </>
    );
}
