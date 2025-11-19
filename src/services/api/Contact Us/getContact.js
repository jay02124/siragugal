import axios from 'axios';
import { baseUrl } from '../../api';

export const getContact = async () => {
  try {
    const response = await axios.get(
      baseUrl + '/contact_services.php?services_type=getApiContact',
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};