import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    originalItems: [],
    totalDiscount: 0,
    appliedCampaigns: [],
    originalPrice: 0,
    newPrice: 0,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCart: (state, action) => {
            state.originalItems = action.payload.originalItems;
            state.totalDiscount = action.payload.totalDiscount;
            state.appliedCampaigns = action.payload.appliedCampaigns;
            state.originalPrice = action.payload.originalPrice;
            state.newPrice = action.payload.newPrice;
        },
        // Add other reducers like addItem and removeItem if needed
    },
});

export const { setCart } = cartSlice.actions;

export default cartSlice.reducer;