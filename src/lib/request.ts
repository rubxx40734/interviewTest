import axios from 'axios'
import { showToast, showLoadingToast, closeToast, setToastDefaultOptions } from 'vant'
import 'vant/es/toast/style'

setToastDefaultOptions({ duration: 3000 })


let loadingCount = 0;

const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
})

// req攔截
service.interceptors.request.use((config: any) => {
  loadingCount++;
  const auth = localStorage.getItem('AUTH_TOKEN')
  // 拿後台選物api來用
  if (auth) {
    config.headers.Authorization = `Bearer ${auth}`;
    return config
  }
})

// res
service.interceptors.response.use((response) => {
  loadingCount--;
  if (loadingCount === 0) {
    closeToast()
  }
  return response;
},
  error => {
    closeToast();
    if (error && error.response) {
      console.log(error.response)
      switch (error.response.status) {
        case 401:
          error.message = error.response.data.debugInfo.log
          break
        case 403:
          error.message = '拒絕訪問'
          break
        case 404:
          error.message = '路徑錯誤'
          break
        case 502:
          error.message = '伺服器錯誤'
          break
        default:
          error.message = `連接錯誤${error.response.status}`
      }
    }
    else {
      error.message = '伺服器請求超時'
    }
    showToast(error.message)
    throw error;
  }
)

export default async function (path = '', method = 'get', params = {}, reqConfig: { isFile?: boolean } = {}) {
  const { isFile } = reqConfig ?? false
  if (!path) {
    showToast('遺失路徑')
  }
  // 設定表頭
  const config = {
    headers: {},
    params: {}, // 用 GET
  }

  // 自動判斷是 JSON 還是 FormData
  const isFormData = params instanceof FormData || isFile;
  if (isFormData) {
    config.headers = {
      'Content-Type': 'multipart/form-data'
    }
  } else {
    config.headers = {
      'Content-Type': 'application/json; charset=utf-8'
    }
  }

  const apiUrl = `${import.meta.env.VITE_API_URL}${path}`

  try {
    if (method.toLowerCase() === 'get') {

      config.params = params;
      const res = await service.get(apiUrl, config);
      return res.data;

    } else {

      const res = await service[method.toLowerCase()](apiUrl, params, config);
      return res.data;
    }
  } catch (error) {
    console.error('error', error);
    throw error;
  }
}
