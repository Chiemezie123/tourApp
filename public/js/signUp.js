import axios from 'axios';
import { showAlert } from './showAlert';

const api = axios.create({
  baseURL: 'http://127.0.0.1:3000', // Base URL
});

export const logout = async () => {
  try {
    console.log('fach');
    const response = await api.get('/api/v1/users/signup');
    if (response) {
      console.log(response, 'response');
      const { status, message } = response.data;
      showAlert('success', message);
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    if (err.response) {
      const { message } = err.response.data;
      showAlert('error', message);
    }
  }
};
