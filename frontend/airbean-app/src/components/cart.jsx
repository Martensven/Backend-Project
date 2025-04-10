import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from './api';
import { toast } from 'react-toastify';

export const Cart = () => {
    const [cart, setCart] = useState({ originalItems: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [views, setViews] = useState(null);
    const navigate = useNavigate();

    // Hämta varukorgen från API
    const fetchCart = async () => {
        try {
            const response = await fetchWithAuth('/cart', { credentials: 'include' });
            const data = await response.json();
            console.log('Received cart data:', JSON.stringify(data, null, 2)); // 🔥 Logga svaret för felsökning
            setCart(data.cart || { originalItems: [] }); // 🔥 Använd API-strukturen
        } catch (error) {
            setError('Det gick inte att hämta varukorgen.');
            toast.error('Fel vid hämtning av varukorgen!');
        } finally {
            setLoading(false);
        }
    };

    // Hämta session-test för att se om sessionen behålls
    const fetchSessionTest = async () => {
        try {
            const res = await fetchWithAuth('/cart/session-test', { credentials: 'include' });
            const data = await res.json();
            setViews(data.views);
            console.log('Session views:', data.views);
        } catch (err) {
            console.error('Kunde inte hämta session views');
        }
    };

    useEffect(() => {
        fetchCart();
        fetchSessionTest();
    }, []);

    // Uppdatera kvantitet på en vara
    const updateQuantity = async (itemId, change) => {
        console.log('Updating item:', { item_id: itemId, quantity: Number(change) }); // 🔥 Logga requesten

        try {
            const res = await fetchWithAuth('/cart/add', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item_id: itemId, quantity: Number(change) })
            });

            const data = await res.json();
            console.log('Update response:', data); // 🔥 Logga API-svaret

            if (!res.ok) {
                toast.error(data.message || 'Kunde inte uppdatera kvantitet');
            } else {
                toast.success(`Uppdaterade ${data.addedItem.title} till ${data.addedItem.quantity} st`);
                fetchCart(); // Uppdatera varukorgen
            }
        } catch (error) {
            toast.error('Något gick fel vid uppdatering!');
            console.error('Error updating item quantity:', error);
        }
    };

    // Ta bort en vara från varukorgen
    const removeItem = async (itemId) => {
        console.log('Removing item:', { item_id: itemId }); // 🔥 Logga requesten

        try {
            const res = await fetchWithAuth('/cart/remove', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item_id: itemId, quantity: 1 })
            });

            const data = await res.json();
            console.log('Remove response:', data); // 🔥 Logga API-svaret

            if (!res.ok) {
                toast.error(data.message || 'Kunde inte ta bort varan');
            } else {
                toast.success(`Tog bort ${data.removedItem.title}`);
                fetchCart(); // Uppdatera varukorgen
            }
        } catch (error) {
            toast.error('Något gick fel vid borttagning!');
            console.error('Error removing item:', error);
        }
    };

    if (loading) return <p>Laddar varukorg...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>Din varukorg</h1>

            {/* Debug info */}
            {views !== null && (
                <p style={{ fontStyle: 'italic', color: 'gray' }}>
                    Session views: {views}
                </p>
            )}

            {/* Varukorgen är tom */}
            {cart.originalItems.length === 0 ? (
                <p>Varukorgen är tom.</p>
            ) : (
                <>
                    {/* Pris och rabatt-information */}
                    <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd' }}>
                        <p><strong>Ordinarie pris:</strong> {cart.originalPrice || 0} kr</p>
                        <p><strong>Rabatt:</strong> -{cart.totalDiscount || 0} kr</p>
                        <p><strong>Att betala:</strong> {cart.newPrice || 0} kr</p>
                    </div>

                    {/* Lista över varor */}
                    <ul>
                        {cart.originalItems.map((item) => (
                            <li key={item._id} style={{ borderBottom: '1px solid #ddd', padding: '10px 0', display: 'flex', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    <strong>{item.item_id?.title || 'Okänd vara'}</strong>
                                    <p>{item.quantity} st - {item.totalPrice} kr</p>
                                </div>
                                <div>
                                    <button onClick={() => updateQuantity(item.item_id, -1)} disabled={item.quantity <= 1}>−</button>
                                    <button onClick={() => updateQuantity(item.item_id, 1)}>+</button>
                                    <button onClick={() => removeItem(item.item_id)} style={{ marginLeft: '10px', color: 'red' }}>🗑️</button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Skapa order-knapp */}
                    <button onClick={() => navigate('/create-order', { state: { cart } })}>
                        Skapa Order
                    </button>
                </>
            )}
        </div>
    );
};
