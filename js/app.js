var app = new Vue({
    el: "#app",
    data: {
        ArabNum: 0,
        ChineseNum: "",
        //ChineseSymbole: ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"],
        ChineseSymbole: ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"],
        ChineseSection: ["", "万", "亿", "万亿"],
        //ChineseUnit: ["", "拾", "佰", "仟"],
        ChineseUnit: ["", "十", "百", "千"],
        ChineseUnitArab: {
            "零": 0,
            "一": 1,
            "二": 2,
            "三": 3,
            "四": 4,
            "五": 5,
            "六": 6,
            "七": 7,
            "八": 8,
            "九": 9,
            "十": 10,
            "百": 100,
            "千": 1000,
            "万": 10000,
            "亿": 100000000,
            "万亿": 1000000000000,
        }
    },
    methods: {
        Arab2Chn: function(v) {
            var chn_num = "",
                sec_idx = 0;
            v = Math.floor(v);
            var CHINESE_SECTION = 10000;
            while (v > 0) {
                if (sec_idx >= this.ChineseUnit.length) {
                    return "数字超过范围！"
                }
                var section = v % CHINESE_SECTION,
                    unit = this.ChineseSection[sec_idx];
                v = Math.floor(v / CHINESE_SECTION);
                sec_idx++;
                if (section == 0) continue;
                var zero_prefix = (v > 0 && section < CHINESE_SECTION / 10) ? this.ChineseSymbole[0] : "";
                chn_num = zero_prefix + this.Arab2Chn_section(section) + unit + chn_num;
            }
            return chn_num;
        },
        Arab2Chn_section: function(v) {
            var num_str = "",
                unit_idx = 0,
                set_zero = false;
            while (v > 0) {
                var n = v % 10,
                    s = this.ChineseSymbole[n],
                    unit = this.ChineseUnit[unit_idx++];
                v = Math.floor(v / 10);
                if (num_str == "" && n == 0) {
                    continue;
                }
                if (n > 0) {
                    if (n == 1 && unit == this.ChineseUnit[1] && v == 0) {
                        s = "";
                    }
                    num_str = s + unit + num_str;
                    set_zero = false;
                } else {
                    if (!set_zero) {
                        set_zero = true;
                        num_str = this.ChineseSymbole[0] + num_str;
                    }
                }
            }
            return num_str;
        },
        Chinese2Arab: function(str) {
            var n = 0,
                si = 0;
            for (var i = 0; i < str.length; i++) {
                var n2 = this.ChineseUnitArab[str[i]];
                if (n2 > 1000) {
                    var n3 = this.Chinese2Arab_section(str.slice(si, i));
                    if (n3 >= 0) {
                        n += n3 * n2;
                    } else {
                        return 0;
                    }
                    si = i + 1;
                }
            }
            var n2 = this.Chinese2Arab_section(str.slice(si));
            if (n2 < 0) {
                return 0;
            }
            return n + n2;
        },
        Chinese2Arab_section: function(str) {
            var n = 0;

            for (var i = 0; i < str.length; i++) {
                var n2 = this.ChineseUnitArab[str[i]];
                if (typeof n2 == "undefined") {
                    // 使用中文拼音输入法时，输入框首先接收到的是拼音，然后才会变成汉字，
                    // 在拼音阶段，可能导致这个报错：
                    console.log("非法字符");
                    continue;
                }
                if (n2 === 0) continue;
                var n3 = 1;
                if (n2 < 10) {
                    if (++i < str.length) {
                        n3 = this.ChineseUnitArab[str[i]];
                        if (n3 < 10) {
                            console.log("invalid: 数字之间缺少单位");
                            return -1;
                        }
                    }
                } else {
                    if (!(n2 == 10 && n == 0)) {
                        console.log("invalid: 单位前面缺少数字");
                        return -1;
                    }
                }
                n += n2 * n3;
            }
            return n;
        },
    },
    computed: {
        ChineseNumLength: function() {
            return Math.max(9, this.ChineseNum.length + 0.5);
        },
    },
    filters: {
        thousandth: {
            read: function(v) {
                var str = "",
                    comma = ",";
                
                while (v > 0) {
                    var left = "" + (v % 1000);
                    v = Math.floor(v / 1000);
                    if (v > 0) {
                        while (left.length < 3) {
                            left = "0" + left;
                        }
                    }
                    if (str == "") {
                        str = left;
                    } else {
                        str = left + "," + str;
                    }
                }
                return str;
            },
            write: function(v) {
                return parseInt(v.replace(/,/g, ""));
            },
        },
    }
})

app.$watch("ArabNum", function(v) {
    this.ChineseNum = this.Arab2Chn(v);
});
app.$watch("ChineseNum", function(v) {
    this.ArabNum = this.Chinese2Arab(v);
});
