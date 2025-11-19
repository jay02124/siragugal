import axios from 'axios';
import { baseUrl } from '../../api';

export const getAbout = async () => {
  try {
    const response = await axios.get(
      baseUrl + '/about_services.php?services_type=getApiAbout',
    );
    // console.log("About us", response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};