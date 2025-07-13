import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api'

export const testConnection = async () => {
    try {
        const response = await axios.get(`${API_URL}/test`);
        return response.data;
        
    } catch (error) {
        console.error('Error en la conexión:', error);
        throw error;
    }
};