import axios from 'axios';
import { baseUrl } from '../../api';

export const getPopupAd = async () => {
  try {
    const response = await axios.get(
      baseUrl + '/popup_services.php?services_type=getApiPopup',
    );
    // console.log("Podcast", response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};