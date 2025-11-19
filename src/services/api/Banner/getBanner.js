import axios from 'axios';
import { baseUrl } from '../../api';

export const getBanner = async () => {
  try {
    const response = await axios.get(
      baseUrl + '/banner_services.php?services_type=getApiBanner',
    );
    // console.log("Banner", response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};