import { useEffect, useState } from 'react';
import { fetchWithAuth } from './api.js';
import { toast } from 'react-toastify';

export const ItemList = () => {
    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://localhost:4321/items')  // Kolla om URL:en är korrekt för din server.
            .then(res => res.json())
            .then(data => {
                console.log('Fetched data:', data);  // Debugg för att se svaret
                if (!data || !data.success || !data.data) {
                    throw new Error('Kunde inte hämta produkter eller ogiltigt svar från servern');
                }
                setItems(data.data || []);  // Sätt varor om det finns
            })
            .catch(err => {
                setError(err.message);
                toast.error('Fel vid hämtning av produkter: ' + err.message);
            });
    }, []);

    const addToCart = async (item_id) => {
        const res = await fetchWithAuth('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ item_id, quantity: 1 })
        });

        const data = await res.json();
        if (!res.ok) {
            toast.error(data.message || 'Kunde inte lägga till vara');
        } else {
            toast.success(`Lade till ${data.addedItem.title}`);
        }
    };

    if (error) return <p style={{ color: 'red' }}>Fel: {error}</p>;
    if (!items.length) return <p>Laddar produkter...</p>;

    return (
        <div>
            <h2>Produkter</h2>
            {
                items.map(item => (
                    <div key={item._id} className='items'>
                        <h4>{item.title} – {item.price} kr</h4>
                        <p>{item.desc}</p>
                        <button onClick={() => addToCart(item._id)}>Lägg i varukorg</button>
                    </div>
                ))
            }

        </div >
    );
};