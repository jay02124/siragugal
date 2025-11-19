import axios from 'axios';
import { baseUrl } from '../../api';

export const getPrivacyPolicy = async () => {
  try {
    const response = await axios.get(
      baseUrl + '/security_services.php?services_type=getApiSecurity&category_name=private_policy',
    );
    // console.log("Privacy Policy", response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};