import axios from 'axios';
import { baseUrl } from '../../api';

export const getLiveBroadcast = async () => {
  try {
    const response = await axios.get(
      baseUrl + '/live_broadcast_services.php?services_type=getApiLiveBroadcast',
    );
    // console.log("Live Broad cast", response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};