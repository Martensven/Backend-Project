import { useDispatch, useSelector } from 'react-redux';
import { setCart } from './store/cartSlice';
import { fetchWithAuth } from './api';
import { useEffect, useState } from 'react';

export const Cart = () => {
    const cart = useSelector((state) => state.cart); // Hämta data från Redux store
    const dispatch = useDispatch();
    const [error, setError] = useState('');

    const fetchCart = async () => {
        try {
            const res = await fetchWithAuth('/cart');
            const data = await res.json();
            console.log('API Response:', data);  // Logga API-svaret

            if (res.ok) {
                // Om API-svaret är korrekt, uppdatera Redux
                dispatch(setCart(data.cart));
            } else {
                setError(data.message || 'Kunde inte hämta varukorg');
            }
        } catch (err) {
            setError('Fel vid hämtning av varukorg.');
            console.error('Fetch error:', err);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    useEffect(() => {
        console.log('Redux cart state:', cart);  // Logga Redux state
    }, [cart]);

    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!cart || !cart.originalItems || cart.originalItems.length === 0) {
        return <p>Laddar varukorg...</p>;
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>Din varukorg</h2>

            {cart.originalItems.length === 0 ? (
                <p>Varukorgen är tom.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {cart.originalItems.map((item) => (
                        <li key={item._id} style={{ borderBottom: '1px solid #ccc', marginBottom: '10px', paddingBottom: '10px' }}>
                            <div>
                                <strong>{item.title}</strong>
                                <div>
                                    {item.quantity} st - {item.totalPrice} kr
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <hr />
            <p>Ordinarie pris: {cart.originalPrice} kr</p>
            <p>Rabatt: -{cart.totalDiscount} kr</p>
            <p>
                <strong>Att betala: {cart.newPrice} kr</strong>
            </p>
        </div>
    );
};