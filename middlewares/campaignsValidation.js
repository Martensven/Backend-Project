export const calculateCampaigns = (items) => {
    const now = new Date();
    const juneEnd = new Date(now.getFullYear(), 5, 30); // till slutet av juni

    let totalDiscount = 0;
    const appliedCampaigns = [];
    const originalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 1. 10% rabatt under perioden (idag till 30 juni)
    if (now <= juneEnd) {
        const discount = originalPrice * 0.1;
        totalDiscount += discount;
        appliedCampaigns.push({
            name: "Sommarrabatt 10% (gäller t.o.m. 30 juni)",
            discount: discount,
            type: "percentage"
        });
    }

    // 2. 50 kr rabatt om mer än 5 varor
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQuantity > 5) {
        totalDiscount += 50;
        appliedCampaigns.push({
            name: "Rabatt på storköp (50 kr för 5+ varor)",
            discount: 50,
            type: "fixed"
        });
    }

    // 3. 10 kr rabatt på bryggkaffe
    const coffeeItems = items.filter(item =>
        item.title && item.title.toLowerCase().includes('bryggkaffe')
    );

    if (coffeeItems.length > 0) {
        const discount = coffeeItems.reduce((sum, item) => {const qty = Number(item.quantity || 0); return sum + (10 * qty);}, 0);
        if (!isNaN(discount)) {
            totalDiscount += discount;
            appliedCampaigns.push({
                name: "10 kr rabatt på bryggkaffe",
                discount: discount,
                type: "item_discount"
            });
        }
    }

    return {
        totalDiscount: Math.min(totalDiscount, originalPrice), // Förhindra negativa summor
        appliedCampaigns,
        originalPrice,
        newPrice: Math.max(0, originalPrice - totalDiscount)
    };
};

export const applyCampaigns = (items) => {
    
    if (!items || !Array.isArray(items)) {
        console.warn("applyCampaigns received invalid items:", items);
        return calculateCampaigns([]);
    }

    const formattedItems = items.map(item => {
        if (!item) {
            return { price: 0, quantity: 0, title: "Unknown" };
        }
    
        const itemData = item.item_id ?? item; // nullish coalescing (säkrare)
        
        return {
            price: itemData?.price || 0,
            quantity: item?.quantity || 0,
            title: itemData?.title || "Unknown"
        };
    });

    return calculateCampaigns(formattedItems);
};