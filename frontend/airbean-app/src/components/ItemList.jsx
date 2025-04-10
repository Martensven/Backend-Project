import { useEffect, useState } from 'react';
import { fetchWithAuth } from './api.js';
import { toast } from 'react-toastify';

export const ItemList = () => {
    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);
    const [views, setViews] = useState(null); // <-- för att visa session views

    useEffect(() => {
        fetch('http://localhost:4321/items')
            .then(res => res.json())
            .then(data => {
                console.log('Fetched data:', data);
                if (!data || !data.success || !data.data) {
                    throw new Error('Kunde inte hämta produkter eller ogiltigt svar från servern');
                }
                setItems(data.data || []);
            })
            .catch(err => {
                setError(err.message);
                toast.error('Fel vid hämtning av produkter: ' + err.message);
            });

        fetchSessionTest(); // <-- session-koll
    }, []);

    const fetchSessionTest = async () => {
        try {
            const res = await fetchWithAuth('/cart/session-test', { credentials: 'include' });
            const data = await res.json();
            setViews(data.views);
        } catch (err) {
            console.error('Kunde inte hämta session views');
        }
    };

    const addToCart = async (item_id) => {
        const res = await fetchWithAuth('/cart/add', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item_id, quantity: 1 })
        });

        const data = await res.json();
        if (!res.ok) {
            toast.error(data.message || 'Kunde inte lägga till vara');
        } else {
            toast.success(`Lade till ${data.addedItem.title}`);
        }

        // Uppdatera session views efter att något lagts till
        fetchSessionTest();
    };

    if (error) return <p style={{ color: 'red' }}>Fel: {error}</p>;
    if (!items.length) return <p>Laddar produkter...</p>;

    return (
        <div>
            <h2>Produkter</h2>
            {views !== null && (
                <p style={{ fontStyle: 'italic', color: 'gray' }}>
                    Session views: {views}
                </p>
            )}
            {
                items.map(item => (
                    <div key={item._id} className='items'>
                        <h4>{item.title} – {item.price} kr</h4>
                        <p>{item.desc}</p>
                        <button onClick={() => addToCart(item._id)}>Lägg i varukorg</button>
                    </div>
                ))
            }
        </div>
    );
};
