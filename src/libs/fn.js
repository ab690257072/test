import axios from 'axios';
import store from '../store/store'
/**
 * @author xiayong
 * @desc   url参数转对象
 * @param  {String} url  default: window.location.href
 * @return {Object} {a: 1, b: 2}
 */
export function parseQueryString(url = window.location.href) {
  	var search = url.lastIndexOf('?') !== -1 ? url.substring(url.lastIndexOf('?') + 1) : '';
  	if (!search) {
      	return {};
  	}
  	return JSON.parse('{"' + decodeURIComponent(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
}
/**
 * @author xiayong
 * @desc   更改url参数方法
 * @param  {String} _query  必填，参数key
 * @param  {String} _newQuery  必填，参数的新value
 */
export function pushStatequery(_query, _newQuery){
    var searchUrl = location.search;
    if (searchUrl.indexOf('&'+_query+'=') != -1) {
        searchUrl = searchUrl.replace('&'+_query+'='+escape(parseQueryString()[_query]), '&'+_query+'='+_newQuery);
    }
    else if (searchUrl.indexOf('?'+_query+'=') != -1) {
    	searchUrl = searchUrl.replace('?'+_query+'='+escape(parseQueryString()[_query]), '?'+_query+'='+_newQuery);
    }
    else{
        let _paramFlag =  searchUrl.indexOf('?') != -1 ? '&' : '?';
        searchUrl = searchUrl+_paramFlag+_query+'='+_newQuery;
    }
    window.history.pushState('','',searchUrl);
}
/**
 * @author xiayong
 * @desc   深度拷贝数组对象
 * @param  {Any} values  必填
 */
export function deepCopy(values) {
    let copy;
    if (null == values || "object" != typeof values) return values;
    if (values instanceof Date) {
        copy = new Date();
        copy.setTime(values.getTime());
        return copy;
    }
    if (values instanceof Array) {
        copy = [];
        for (let i = 0, len = values.length; i < len; i++) {
            copy[i] = deepCopy(values[i]);
        }
        return copy;
    }
    if (values instanceof Object) {
        copy = {};
        for (let attr in values) {
            if (values.hasOwnProperty(attr)) copy[attr] = deepCopy(values[attr]);
        }
        return copy;
    }
    throw new Error("Unable to copy values! Its type isn't supported.");
}
/**
 * @author xiayong
 * @desc   localstorage存储
 * @param  {String} key 必填
 */
// 得到
export function getLocalStore(key) {
    return JSON.parse(window.localStorage.getItem(key)) || '';
}
// 设置
export function setLocalStore(key, val) {
    window.localStorage.setItem(key, JSON.stringify(val));
}
// 删除项
export function removeLocalItem(key) {
    window.localStorage.removeItem(key);
}
/**
 * @author xiayong
 * @desc   发送请求
 * @param  {String} method 必填 get|post
 * @param  {String} url 必填
 * @param  {Object} data 选填 query
 * @param  {Function} callback 选填
 * @param  {Function} errCb 选填
 */
export function handleRequest(type, url, data, callback, errCb, boo = false) {
    let obj = {
        method: type,
        url: url
    };
    if(type == 'post' || type == 'POST') {
        !boo ? obj.headers = { 'content-type': 'application/x-www-form-urlencoded' } : null;
    }
    if(data) {
        if(type == 'post' || type == 'POST') {
            if(boo) {
                obj.data = data;
            } else {
                obj.data = stringfyQueryString(data);
            }
        } else {
            obj.params = data;
        }
    }
    axios(obj).then(res => {
        if(res.data.needlogin) {
            store.dispatch('storeLogout');
        } else {
            callback ? callback(res) : null;
        }
    }).catch(err => {
        errCb ? errCb(err) : null;
    });
}
/**
 * @author xiayong
 * @desc   url参数数组格式化
 * @desc   用逗号判断，并不太好，慎用
 * @param  {Object} obj 要处理的对象
 * @param  {Array}  arr 要处理的字段名字汇总
 */
export function formatQuery(obj, arr) {
    let keys = Object.keys(obj);
    if(keys.length !== 0) {
        keys.forEach(key => {
            if(arr.indexOf(key) !== -1) {
                obj[key] = obj[key].split(',');
            }
        });
    }
    return obj;
}
/**
 * @author xiayong
 * @desc   金额格式化|浮点数精确计算
 * @param  {String}  str 数据
 * @param  {Number}  num 截取长度
 * @param  {Boolean} boo 金额是否特殊处理
 * @param  {Number}  float 十进制保留小数位数
 */
function round10 (value, exp) { // 四舍五入调整
    if (typeof exp === 'undefined' || +exp === 0) {
        return Math.round(value);
    }
    value = +value;
    exp = +exp;
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
        return NaN;
    }
    value = value.toString().split('e');
    value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}
function formatMoney (str, num) {
    var newStr = "";
    var count = 0;
    str = round10(+str, num) + ''; // 先四舍五入再变为字符串
    if (str.indexOf(".") == -1) {
        for (var i = str.length - 1; i >= 0; i--) {
            if (count % 3 == 0 && count != 0) {
                newStr = str.charAt(i) + "," + newStr;
            } else {
                newStr = str.charAt(i) + newStr;
            }
            count++;
        }
        str = newStr + ".00"; //自动补小数点后两位
    } else {
        for (var i = str.indexOf(".") - 1; i >= 0; i--) {
            if (count % 3 == 0 && count != 0) {
                newStr = str.charAt(i) + "," + newStr;
            } else {
                newStr = str.charAt(i) + newStr; //逐个字符相接起来
            }
            count++;
        }
        str = newStr + (str + "00").substr((str + "00").indexOf("."), 3);
    }
    return str;
}
export function toFixNum (str, num, boo, float) {
    var res = '';
    if (boo) {
        res = formatMoney(str, float); // 金额保留位数四舍五入
        return res.slice(0, res.length - num); // 截取长度
    }
    // 非金额
    if (num !== undefined) {
        return round10(parseFloat(str), -num); // 保留n位小数
    } else {
        return round10(parseFloat(str), 0); // 取整
    }
}
// 千分金额无小数点
export function toFixThree(num) {
    return toFixNum(num, 3, true, 0);
}
//千分金额，有小数点
export function toFixThreeFloat(money) {
    if(money && money != null) {
        money = String(money);
        let left = money.split('.')[0],
            right = money.split('.')[1],
            temp = left.split('').reverse().join('').match(/(\d{1,3})/g);
      right = right
                ? right.length >= 2
                ? right.substr(1, 2) == 0
                ? right.substr(0, 1) == 0
                ? ''
                : `.${right.substr(0, 1)}`
                : `.${right.substr(0, 2)}`
                : `.${right}` 
                : '';
      return (Number(money) < 0 ? '-' : '') + temp.join(',').split('').reverse().join('') + right;
    }else if (money === 0) {
        return '0';
    }else {
        return '';
    }
}
/**
 * @author xiayong
 * @desc   获取全部标签
 */
export function getAllTags() {
    return axios.get('/api/base/tag/search').then(res => {
        const _data = res.data;
        if(_data.success) {
            return _data.tags.map(obj => {
                return obj = {
                    label: obj.name,
                    value: obj.id
                }
            });
        }
    }).catch(err => console.log(err));
}
/**
 * @author xiayong
 * @desc   生成从m到n的数组
 * @param {Number} start 起始数
 * @param {Number} end   结束数
 */
export function arrByLen(start = 0, end = 0) {
    return Array.from({length: (end - start)}, (v, k) => k + start);
}
/**
 * @author   xiayong
 * @function chunkArr 数组分块
 * @desc     [1,2,3,4] => [[1,2],[3,4]]
 * @param    {Array} arr 原始数组
 * @param    {Number} num 子数组元素数
 */
export function chunkArr(arr, num) {
    let res = [];
    for(let i = 0; i < arr.length; i += num) {
      res.push(arr.slice(i, i + num));
    }
    return res;
}
/**
 * @author         xiayong
 * @function       判断提交数据是否为空
 * @data           要判断的数据对象
 * @canEmptyArr    可以为空的参数名称
 * @_this          当前页面的this
 */
export function checkEmpty(data, _this, canEmptyArr = []) {
    let _lock = false,
        _isArr = data instanceof Array ? true : false;
    let checkFn = (source) => {
        Object.keys(source).every(key => {
            let _isEmpty = false;
            canEmptyArr.forEach(c => {
                if (key === c) {
                    _isEmpty = true;
                }
            });
            if(!_isEmpty && (source[key].length === 0 || (typeof source[key] === 'string' && source[key].trim() === ''))) {
                _this.$Message.destroy();
                _this.$Message.warning('请填写完整信息');
                _lock = true;
                return;
            } else {
                return true;
            }
        });
    };
    if (_isArr) {
        if (data.length === 0) {
            _this.$Message.destroy();
            _this.$Message.warning('请填写完整信息');
            return false;
        }
        data.forEach(d => {
            checkFn(d);
        });
    } else {
        checkFn(data);
    }
    return !_lock;
}
/**
 * @author  xiayong
 * @desc   对象序列化
 * @param  {Object} obj 
 * @return {String}
 */
export function stringfyQueryString(obj) {
    if (!obj) return '';
    let pairs = [];
    for (let key in obj) {
        let value = obj[key];
        if (value instanceof Array) {
            for (let i = 0; i < value.length; ++i) {
                pairs.push(encodeURIComponent(key + '[' + i + ']') + '=' + encodeURIComponent(value[i]));
            }
            continue;
        }
        pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
    }
    return pairs.join('&');
}
/**
 * @author   xiayong
 * @function 获取地址list
 */
export function getAds() {
    return axios.get('/api/common/region/listAll').then(res => {
        const _data = res.data;
        if(_data.success) {
            // id转为字符串
            _data.provinceList.forEach(province => {
                province.value = province.value + '';
                province.parentId = province.parentId + '';
                province.children.forEach(city => {
                    city.value = city.value + '';
                    city.parentId = city.parentId + '';
                    city.children.forEach(area => {
                        area.value = area.value + '';
                        area.parentId = area.parentId + '';
                    });
                });
            });
            return _data.provinceList;
        }
    }).catch(err => console.log(err));
}
/**
 * @author   xiayong
 * @function 获取仓库list
 */
export function getStockNameList(data = { type: '0,1,2' }) {
    return axios.get('/api/depot/warehouse/list', {
        params: data
    }).then(res => {
        const _data = res.data;
        if(_data.success) {
            _data.warehouseList.forEach(x => {
                x.label = x.name;
                x.value = x.id;
            });
            return _data.warehouseList;
        }
    }).catch(err => console.log(err));
}
/**
 * @author   xiayong
 * @function 获取业务list
 */
export function getListBusinessType() {
    return axios.get('/api/depot/stock/listBusinessType').then(res => {
        let _data = res.data,
            _blist = [],
            arrList = [];
        if(_data.success) {
            Object.keys(_data.list).forEach(key => {
                _blist.push({
                    label: key,
                    value: ''
                });
                arrList.push(_data.list[key]);
            });
            _blist.forEach((item, i) => item.value = i + '');
            return {
                filter: _blist,
                option: arrList
            };
        }
    }).catch(err => console.log(err));
}
/**
 * @author   xiayong
 * @function 获取门店list
 */
export function getStoreNameList() {
    return axios.get('/api/store/mendian/list').then(res => {
        const _data = res.data;
        if(_data.success) {
            return _data.mendianList.map(o => ({ label: o.name, value: o.id, enabled: o.enabled }));
        }
    }).catch(err => console.log(err));
}
/**
 * @author   xiayong
 * @function 获取供应商list
 */
export function getSupplierList() {
    return axios.get('/api/procurement/supplier/search').then(res => {
        const _data = res.data;
        if(_data.success) {
            return _data.tableData.map(o => ({ label: o.supplierName, value: o.id, addGoods: o.addGoods, sn: o.supplierSn }));
        }
    }).catch(err => console.log(err));
}
/**
 * @author   caoyiming
 * @function 获取渠道list
 */
export function getChannelList() {
    return axios.get('/api/order/selectSellChannels').then(res => {
        const _data = res.data;
        if(_data.success) {
            return _data.data.map(o => ({ label: o.channelName, value: o.id}));
        }
    }).catch(err => console.log(err));
}
/**
 * @author   xiayong
 * @function 时间格式化
 * @desc 2018-03-12 15:56:56
 */
function toFix(num) {
    return num < 10 ? '0' + num : num;
}
export function normalTime(time, type) {
    if (time) {
        let oDate = new Date();
        oDate.setTime(new Date(time));
        let y = oDate.getFullYear();
        let m = oDate.getMonth() + 1;
        let d = oDate.getDate();
        let h = oDate.getHours();
        let mm = oDate.getMinutes();
        let s = oDate.getSeconds();
        if (type == 'ymd') {
            return y + '-' + toFix(m) + '-' + toFix(d);
        } else {
            return y + '-' + toFix(m) + '-' + toFix(d) + ' ' + toFix(h) + ':' + toFix(mm) + ':' + toFix(s);
        };        
    } else {
        return '';
    }
}
/**
 * @author   xiayong
 * @function 改变url中的字段
 * @param {String} name 字段名
 * @param {String} key  值
 */
export function changeUrlQuery(name, key) {
    const idx = location.href.indexOf('?'),
            _path = idx !== -1 ? location.hash.substr(0, location.hash.indexOf('?')) : location.hash,
            query = idx !== -1 ? location.href.substr(idx) : '',
            reg = new RegExp(`${name}=([^&]*)`);
    if(query === '') {
        history.replaceState(null, '', `${_path}?${name}=${encodeURIComponent(key)}`); // 无查询串
    } else if(reg.test(query)) {
        history.replaceState(null, '', `${_path}${query.replace(reg, `${name}=${encodeURIComponent(key)}`)}`); // 有字段
    } else {
        history.replaceState(null, '', `${_path}${query + `&${name}=${encodeURIComponent(key)}`}`); // 无字段
    }
}
/**
 * @author   xiayong
 * @function 校验对象属性值是否为正数
 * @param {Object} obj 数据
 * @param {Array}  arr 检测字段 [{ label: '提示语', value: 'key' }]
 */
export function isObjPropNum(_this, obj = {}, arr = [], ifFloat) {
    if(arr.length === 0) return false;
    const reg = ifFloat ? /^[+]?([0-9]*[.])?[0-9]+$/ : /^\d+$/; // 是否检测浮点数
    for(let o of arr) {
        if(!+obj[o.value] || !reg.test(+obj[o.value])) {
            _this.$Message.destroy();
            _this.$Message.warning(`${o.label}需输入正${!ifFloat ? '整' : ''}数`);
            return false;
        }
    }
    return true;
}
/**
 * @author   xiayong
 * @function 信息handle
 */
export function msgHandler(type, msg, _this, _time = 2.5) {
    _this.$Message.destroy();
    _this.$Message[type]({
        content: msg,
        duration: _time
    });
}
/**
 * @author   xiayong
 * @function 对象数组根据key去重
 */
export function arrUniqBy(arr = [], key = '') {
    let obj = {};
    return arr.reduce((item, next) => {
        obj[next[key]] ? '' : obj[next[key]] = true && item.push(next);
        return item;
    }, []);
}
/**
 * @author   xiayong
 * @function 数组查重
 */
export function checkIfArrayIsUnique(arr) {
    return arr.length === new Set(arr).size;
}
/**
 * @author   xiayong
 * @function 打印
 */
export function toPrint(_this, type, ids, shippingCompanyId) {
    let _params = { type: type };
    if(Array.isArray(ids)) {
        _params.ids = ids.join(',');
    } else if(ids || ids === 0) {
        _params.ids = ids;
    }
    if(shippingCompanyId || shippingCompanyId === 0) {
        _params.companyType = shippingCompanyId;
    }
    if(type == 3 || type == 4){
        const { href } = _this.$router.resolve({
            name: 'Procurement',
            query: _params
        });
        window.open(href, '_blank');
    }else{
        _this.$router.push({
            name: 'Procurement',
            query: _params
        });
    }
}
/**
 * @author   xiayong
 * @function 获取元素文档绝对距离
 */
export function getPosition(el) {
    let x = el.offsetLeft,
        y = el.offsetTop,
        cur = el.offsetParent;
    while(cur !== null) {
        x += cur.offsetLeft;
        y += cur.offsetTop;
        cur = cur.offsetParent;
    }
    return { x: x, y: y };
}
/**
 * @author   xiayong
 * @function 获取元素的高度和距离
 */
export function initHeaderHeight(_this) {
    // 每次都需要在fixed为false的情况下计算高度
    _this.$store.dispatch('noFixHeader').then(() => {
        const el = document.querySelector('.cdt-table .ivu-table-header'),
            el2 = document.querySelector('.table-header'),
            footEl = document.querySelector('.footer-ct'),
            _h = el ? el.offsetHeight : el2 ? el2.offsetHeight : 0,
            footH = footEl ? footEl.offsetHeight : 0,
            offsetTop = el ? getPosition(el).y : el2 ? getPosition(el2).y : 0;
        _this.$store.dispatch('saveHeaderSize', {_h: _h, offsetT: offsetTop - 10, footH: footH}); // 减10是为了留出上面10像素的padding
    });
}