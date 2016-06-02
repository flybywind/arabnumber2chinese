
## 阿拉伯数字转中文
  给定一个阿拉伯数字，把它转变为汉语表示的数字。
### 算法
根据中文的计数方法，可以把阿拉伯数字按4个一组分成若干section，每个section从低到高的单位分别为 “”，“万”，“亿”，“万亿”。

每个section内的转换方法是一样的，比如1234，就是"一千二百三十四"，加上对应的单位，如“万”，就是“一千二百三十四万”。但是在其中又有些细节需要注意：

* 结尾的零都忽略，如1200，就是一千二百
* 中间的零，只需要用一个零表示，如1004，是一千零四
* 如果整个section都是0，全部忽略
* 如果section在10到19之间，则十位可以省略一；否则，十位上的“一”都不能省。如12就是“十二”，312就是“三百一十二”

## 中文转阿拉伯数字

给定一个中文数字，如“一千二百三十四万”，把它们转换成阿拉伯数字

### 算法
跟上面类似，以“万”，“亿”，“万亿”为分割位，先把中文分成若干section，每个section的转换方法一样，然后section数值乘以相应的权重，如section为“万”就是乘以10000，“亿”是乘以100000000，最低位的section，权重就是1。
将每个section的结果累加就是最终结果。

每个section最多8个汉字，都是以“数字+单位”的形式成对出现。将`数字*单位`的结果累加起来就是最终结果。单位从低到高就是1，10， 100， 1000。

需要注意的细节有：

* “零”忽略即可
* 如果第一位是“十”，在数字默认为一。

## 实现细节

分别通过Vuejs和angularjs实现了一遍，正好可以对比一下二者的不同。大部分代码二者都差不多。

但是为了方便阅读，我对阿拉伯数字采用了**千分位**分隔，当用户在输入框中输入完成按下回车后，输入框内的阿拉伯数字自动用逗号分隔。差异注意出现在这个实现方法上。

### Vuejs实现

```
// html视图：
<input type="text" v-model="ArabNum|thousandth">

// js逻辑：
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
    // 区别主要在这里：
    filters: {
        thousandth: {
            read: function(v) {
                var str = "";
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
    },
    methods: {
        Arab2Chn: function(v) { ... },
        Arab2Chn_section: function(v) { ... },
        Chinese2Arab: function(str) { ... },
        Chinese2Arab_section: function(str) { ... },
    },
    computed: { ... },
})

```

Vuejs方便的地方在于，filter可以用在v-model中，只要分别设计read和write函数即可实现双向绑定。read用于model到view的转换，write用于view到model的转换。

### Angularjs实现

相比于Vuejs，如果在ng-model中直接使用filter，会报错：
```
<input type="text" ng-model="ArabNum|thousandth" >
// error:
Expression 'ArabNum|thousandth' is non-assignable
```

为了实现和Vuejs类似的逻辑，我首先google了一下，发现只能通过directive实现：
```
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
```
可以看到，首先ng的语法要麻烦很多。而且`$formatters`只有在内部的model被改变时，才会对view生效。比如input改变时，`$parsers`先调用(V-->M)，返回值直接给了ngModel，但是`$formatters`不会调用，即M-->V不会被调用，否则 M修改V，V又修改M，就是死循环了。

只有你通过程序修改了`ArabNum`后，`$formatters`才会调用(M-->V)。所以，必须通过jquery的方式，在blur函数中，对element的value进行直接修改，才能实现上述Vue的效果。

## 总结

只要仔细一点，耐心一点，两个数字表示方式的转换还是比较容易实现的。

通过对比Vue和angular可以看到，Vue确实比Ng要方便些。这只是其中的一个方面。
