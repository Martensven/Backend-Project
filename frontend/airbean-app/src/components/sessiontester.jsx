import { useState } from "react";

function SessionTester() {
    const [views, setViews] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:4321/cart/session-test', {
                method: 'GET',
                credentials: 'include', //  Viktigt för att session-cookien ska skickas
            });

            if (!response.ok) throw new Error('Något gick fel');

            const data = await response.json();
            setViews(data.views);
        } catch (error) {
            console.error('Fel:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <button onClick={handleClick} disabled={loading}>
                {loading ? 'Laddar...' : 'Kolla session'}
            </button>
            {views !== null && (
                <p>Du har anropat denna route {views} {views === 1 ? 'gång' : 'gånger'} i samma session.</p>
            )}
        </div>
    );
}

export default SessionTester;