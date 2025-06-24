//全局过滤器
export default {
    //value就是过滤的数据，value就是查询 1或0
    fmtSex: (value) => {
        if (value == 0) {
            return '女士';
        } else if (value == 1) {
            return '先生';
        } else {
            return '未知'
        }
    },
    fmtPrice: (value) => {
        return parseFloat(value).toFixed(2);
    }
}