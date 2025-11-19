import axios from 'axios';
import { baseUrl } from '../../api';

export const getTermsCondition = async () => {
  try {
    const response = await axios.get(
      baseUrl + '/security_services.php?services_type=getApiSecurity&category_name=terms_and_condition',
    );
    // console.log("Terms and Condition", response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};