import axios from 'axios';
import { baseUrl } from '../../api';

export const getSongRequest = async () => {
  try {
    const response = await axios.get(
      baseUrl + '/request_services.php?services_type=getApiRequest',
    );
    // console.log("Song Request", response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};