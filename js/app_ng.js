var app = angular.module("app", []);
app.controller("Ctrl", ["$scope",
    function(scope) {
        var ChineseSymbole = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"],
            ChineseSection = ["", "万", "亿", "万亿"],
            //ChineseUnit: ["", "拾", "佰", "仟"],
            ChineseUnit = ["", "十", "百", "千"],
            ChineseUnitArab = {
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
            };
        scope.ArabNum = 123;

        function Arab2Chn(v) {
            var chn_num = "",
                sec_idx = 0;
            v = Math.floor(v);
            var CHINESE_SECTION = 10000;
            while (v > 0) {
                if (sec_idx >= ChineseUnit.length) {
                    return "数字超过范围！"
                }
                var section = v % CHINESE_SECTION,
                    unit = ChineseSection[sec_idx];
                v = Math.floor(v / CHINESE_SECTION);
                sec_idx++;
                if (section == 0) continue;
                var zero_prefix = (v > 0 && section < CHINESE_SECTION / 10) ? ChineseSymbole[0] : "";
                chn_num = zero_prefix + Arab2Chn_section(section) + unit + chn_num;
            }
            return chn_num;
        }

        function Arab2Chn_section(v) {
            var num_str = "",
                unit_idx = 0,
                set_zero = false;
            while (v > 0) {
                var n = v % 10,
                    s = ChineseSymbole[n],
                    unit = ChineseUnit[unit_idx++];
                v = Math.floor(v / 10);
                if (num_str == "" && n == 0) {
                    continue;
                }
                if (n > 0) {
                    if (n == 1 && unit == ChineseUnit[1] && v == 0) {
                        s = "";
                    }
                    num_str = s + unit + num_str;
                    set_zero = false;
                } else {
                    if (!set_zero) {
                        set_zero = true;
                        num_str = ChineseSymbole[0] + num_str;
                    }
                }
            }
            return num_str;
        }

        function Chinese2Arab(str) {
            var n = 0,
                si = 0;
            for (var i = 0; i < str.length; i++) {
                var n2 = ChineseUnitArab[str[i]];
                if (n2 > 1000) {
                    var n3 = Chinese2Arab_section(str.slice(si, i));
                    if (n3 >= 0) {
                        n += n3 * n2;
                    } else {
                        return 0;
                    }
                    si = i + 1;
                }
            }
            var n2 = Chinese2Arab_section(str.slice(si));
            if (n2 < 0) {
                return 0;
            }
            return n + n2;
        }

        function Chinese2Arab_section(str) {
            var n = 0;

            for (var i = 0; i < str.length; i++) {
                var n2 = ChineseUnitArab[str[i]];
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
                        n3 = ChineseUnitArab[str[i]];
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
        }
        scope.$watch("ChineseNum", function(v) {
            scope.ArabNum = Chinese2Arab(v);
            scope.ChineseNumLength = Math.max(9, scope.ChineseNum.length + 0.5);
        })
        scope.$watch("ArabNum", function(v) {
            scope.ChineseNum = Arab2Chn(v);
        })
    }
]);

app.directive("thousandth", function() {
    return {
        require: "ngModel",
        link: function(scope, elm, attr, ngModel) {
            function thousandth(v) {
                var str = "",
                    v = "" + v;
                v = v.replace(/,/g, "");
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
            }

            elm.on("blur", function(v) {
                elm.val(thousandth(ngModel.$modelValue));
            });
            // model -> view
            ngModel.$formatters.push(function(data) {
                return thousandth(data)
            })
            // view -> model
            ngModel.$parsers.push(function(v) {
                v = "" + v;
                return parseInt(v.replace(/,/g, ""));
            });
        }
    }
})
