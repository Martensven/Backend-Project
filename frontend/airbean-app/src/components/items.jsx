import { useEffect, useState } from 'react';

export const Items = () => {
    const [items, setItems] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('http://localhost:4321/items')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Kunde inte hämta items');
                }
                return res.json();
            })
            .then(data => setItems(data.data)) // .data innehåller själva arrayen
            .catch(err => setError(err.message));
    }, []);

    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!items.length) return <p>Laddar...</p>;

    return (
        <div>
            {items.map(item => (
                <div className='item' key={item._id}>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                    <p><strong>Pris:</strong> {item.price} kr</p>
                </div>
            ))}
        </div>
    );
};

