import { useEffect, useState } from 'react';

export const About = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('http://localhost:4321/about/67f409d2089dd37508756370')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Kunde inte hämta data');
                }
                return res.json();
            })
            .then(data => setData(data))
            .catch(err => setError(err.message));
    }, []);

    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!data) return <p>Laddar...</p>;

    return (
        <div>
            <h1>{data.title}</h1>
            <p>{data.content}</p>
        </div>
    );
};

