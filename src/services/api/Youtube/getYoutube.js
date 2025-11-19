import axios from 'axios';
import { baseUrl } from '../../api';

export const getYoutube = async () => {
  try {
    const response = await axios.get(
      baseUrl + '/youtube_services.php?services_type=getApiYoutube',
    );
    // console.log("Song Request", response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};