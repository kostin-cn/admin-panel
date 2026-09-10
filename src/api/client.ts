import axios from 'axios';
import mockAdapter from './mockAdapter';

import type { AxiosError, AxiosResponse } from 'axios';

const api = axios.create({
  baseURL: '/api',
  adapter: mockAdapter
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;
