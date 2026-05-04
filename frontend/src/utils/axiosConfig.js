import axios from 'axios';

let activeRequests = 0;

export const setupAxiosInterceptors = (setLoading) => {
  axios.interceptors.request.use(
    (config) => {
      activeRequests++;
      setLoading(true);
      return config;
    },
    (error) => {
      activeRequests--;
      if (activeRequests === 0) setLoading(false);
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => {
      activeRequests--;
      if (activeRequests === 0) setLoading(false);
      return response;
    },
    (error) => {
      activeRequests--;
      if (activeRequests === 0) setLoading(false);
      return Promise.reject(error);
    }
  );
};