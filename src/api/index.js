import axios from "axios"
import qs from "qs"

//创建axios对象，做一些基础设置
const axiosInstance =  axios.create({
    baseURL:'http://localhost:10001',
    timeout:50000
});

//常用get方式请求，封装成一个get(). 参数：url请求路径，get请求传递参数就是在地址栏
// http://localhost:10001/goods?id=101   传统方式传递参数
// RESTFul  http://localhost:10001/goods/101
export function get(url, config = {}) {
  return axiosInstance.get(url, {
    ...config,  // 合并所有配置
    params: config.params || {} // 确保params存在
  });
}
export function put(url, params, isJSON = true) {
    const headers = {
        'Content-Type': isJSON 
            ? 'application/json'
            : 'application/x-www-form-urlencoded;charset=utf-8'
    };
    
    const data = isJSON ? params : qs.stringify(params);
    return axiosInstance.put(url, data, { headers });
}
export function del(url) {
    return axiosInstance.delete(url);
}

// HTTP协议 Get和 Post区别
//常用post方式请求，封装成一个post().  post传递参数是在请求体； 请求报文(行、头、体)
export function post(url,params,isJSON){
    let headers = {
        'Content-Type': 'application/json'
    }

    //isJSON true表示传递参数是json格式,false表示传递参数是 参数形式(qs)
    if(!isJSON){
        //参数形式传递
        params = qs.stringify(params);  //把 params 对象转换为 URL 编码的字符串，再将转换后的字符串重新赋值给 params 变量
        headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    }
    return  axiosInstance.post(url,params,headers);
}