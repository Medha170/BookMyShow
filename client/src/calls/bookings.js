import { axiosInstance } from ".";

// Making payment
export const makePayment = async (token, amount) => {
    try{
        const response = await axiosInstance.post('/api/bookings/make-payment', {token, amount});
        // console.log(token, amount, response);
        return response.data;
    }catch(err){
        return err.response
    }
}

// Booking a Show
export const bookShow = async (payload) => {
    try{
        const response = await axiosInstance.post('/api/bookings/book-show', payload);
        console.log(response.data);
        return response.data;
    }catch(err){
        return err.response
    }
}

// Getting all bookings
export const getAllBookings = async () => {
    try{
        const response = await axiosInstance.get('/api/bookings/get-all-bookings');
        return response.data;
    }catch(err){
        return err.response;
    }
}

