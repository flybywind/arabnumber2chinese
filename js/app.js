var app = new Vue({
    el: "#app",
    data: {
        ArabNum: 0,
        ChineseNum: "",
        //ChineseSymbole: ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"],
        ChineseSymbole: ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"],
        ChineseSection: ["", "万", "亿", "万亿", "亿亿"],
        //ChineseUnit: ["", "拾", "佰", "仟"],
        ChineseUnit: ["", "十", "百", "千"],
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
