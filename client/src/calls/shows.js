import { axiosInstance } from ".";

// Adding a show
export const addShow = async (payload) => {
    try{
        const response = await axiosInstance.post('/api/shows/add-show', payload);
        return response.data;
    }catch(err){
        return err.message;
    }
}

// Updating a show
export const updateShow = async (payload) => {    
    try{
        const response = await axiosInstance.put('/api/shows/update-show', payload);
        console.log(payload, response)
        return response.data;
    }catch(err){
        return err.response;
    }
}

// Getting a show by theatre
export const getShowsByTheatre = async (payload) => {
    try{
        const response = await axiosInstance.get('/api/shows/get-all-shows-by-theatre', payload);
        return response.data;
    }catch(err){
        return err.response;
    }
}

// Deleting a show
export const deleteShow = async (payload) => {
    try{
        const response = await axiosInstance.delete('/api/shows/delete-show', payload);
        return response.data;
    }catch(err){
        return err.response;
    }
}

// Getting all Theatres by Movie
export const getAllTheatresByMovie = async (payload) => {
    try{
        const response = await axiosInstance.get('/api/shows/get-all-theatres-by-movie', payload);
        return response.data;
    }catch(err){
        return err.response;
    }
}


// Getting Shows by Id
export const getShowById = async (payload) => {
    try{
        const response = await axiosInstance.get('/api/shows/get-show-by-id', payload);
        return response.data;
    }catch(err){
        return err.message;
    }
}