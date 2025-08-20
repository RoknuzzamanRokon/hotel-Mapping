import axios from "axios";

const API_URL = "http://127.0.0.1:7770/hotel/pushhotel";

export const pushHotels = async (supplier_code, hotel_ids) => {
  try {
    const response = await axios.post(
      API_URL,
      {
        supplier_code,
        hotel_id: hotel_ids,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};


// src/api.js
export const getHotelDetails = async (supplier_code, hotel_id) => {
  try {
    const response = await axios.post('http://127.0.0.1:7770/hotel/details', {
      supplier_code,
      hotel_id
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Hotel Details Error:', error);
    throw error;
  }
};