import axios from 'axios';
import { baseUrl } from '../../api';

export const getPodcast = async () => {
  try {
    const response = await axios.get(
      baseUrl + '/broadcast_services.php?services_type=getApiBroadcast',
    );
    // console.log("Podcast", response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};