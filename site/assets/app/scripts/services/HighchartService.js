/**
 * Created by xieyiming on 15-1-30.
 */


angular.module('service.highchart', [])

    .service("HighchartService", ["$q", function ($q) {
        var self = this

        Highcharts.setOptions({
            lang: {
                shortMonths: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
                weekdays: ["周日", "星期一", "星期二", "星期三", "星期四", "星期五", "周六"]
            }
        })

        self._chartOptionForUser = {}

        self.temperature_chartOptionForTemp = {

            tooltip: {
                backgroundColor: '#FCFFC5',
            },

            options: {
                chart: {
                    type: 'line',
                    zoomType: 'x'
                },

                credits: {
                    enabled: false
                },

                legend: {
                    enabled: true
                },
                tooltip: {
                    backgroundColor: '#FCFFC5',
                    crosshairs: {
                        width: 1,
                        color: 'gray',
                        dashStyle: 'shortdot'
                    }
                }
            },

            title: {
                style: {
                    color: 'rgb(171, 171, 171)',
                    fontSize: 'small'
                },
                text: ''
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    day: '%b%e日',
                    hour: '%H:%M',
                    minute: '%b%e日 %H:%M',
                    month: '%b %y',
                    week: '%b%e日'
                }
            },

            yAxis: [{
                title: {text: ""},

                labels: {
                    //format: '{value} ℃',
                    formatter: function () {
                        return this.value + "℃"
                    }
                }
            },
                {
                    title: {text: ""},

                    labels: {
                        //format: '{value} %RH'
                        formatter: function () {
                            return this.value + "%RH"
                        }
                    },
                    opposite: true
                },
            ],

            series: [
                {
                    name: "温度",
                    color: "#FF0000",
                    data: [[Date.UTC(2015, 11, 9, 01, 15), 10], [Date.UTC(2015, 11, 9, 02, 20), 15], [Date.UTC(2015, 11, 9, 03, 30), 12],
                        [Date.UTC(2015, 11, 9, 04, 35), 19], [Date.UTC(2015, 11, 9, 05, 40), 15], [Date.UTC(2015, 11, 9, 06, 45), 10], [Date.UTC(2015, 11, 9, 07, 50), 8],
                        [Date.UTC(2015, 11, 9, 08, 30), 8], [Date.UTC(2015, 11, 9, 09, 30), 7], [Date.UTC(2015, 11, 9, 10, 30), 1]]
                },
                {
                    name: "湿度",
                    yAxis: 1,
                    color: "#32C3FD",
                    data: [[Date.UTC(2015, 11, 9, 01, 15), 20], [Date.UTC(2015, 11, 9, 02, 20), 18], [Date.UTC(2015, 11, 9, 03, 30), 16],
                        [Date.UTC(2015, 11, 9, 04, 35), 50], [Date.UTC(2015, 11, 9, 05, 40), 60], [Date.UTC(2015, 11, 9, 06, 45), 18], [Date.UTC(2015, 11, 9, 07, 50), 8],
                        [Date.UTC(2015, 11, 9, 08, 30), 5], [Date.UTC(2015, 11, 9, 09, 30), 8], [Date.UTC(2015, 11, 9, 10, 30), 3]]
                }
            ],

            loading: false
        }

        self.lux_chartOptionForTemp = {

            tooltip: {
                backgroundColor: '#FCFFC5'
            },

            options: {
                chart: {
                    type: 'line',
                    zoomType: 'x'
                },

                credits: {
                    enabled: false
                },

                legend: {
                    enabled: false
                },
                tooltip: {
                    backgroundColor: '#FCFFC5',
                    crosshairs: {
                        width: 1,
                        color: 'gray',
                        dashStyle: 'shortdot'
                    }
                }
            },

            series: [
                {
                    name: "光照",
//          color: "rgb(94, 169, 111)",
                    color: "#FFB577",
                    /*  pointStart: Date.UTC(2015, 11, 9),
                     //          pointInterval: 3600 * 1000 * 24,
                     pointInterval: 3600 * 1000,*/
                    data: [[Date.UTC(2015, 11, 9, 01, 15), 10], [Date.UTC(2015, 11, 9, 02, 20), 15], [Date.UTC(2015, 11, 9, 03, 30), 12],
                        [Date.UTC(2015, 11, 9, 04, 35), 19], [Date.UTC(2015, 11, 9, 05, 40), 15], [Date.UTC(2015, 11, 9, 06, 45), 10], [Date.UTC(2015, 11, 9, 07, 50), 8],
                        [Date.UTC(2015, 11, 9, 08, 30), 8], [Date.UTC(2015, 11, 9, 09, 30), 7], [Date.UTC(2015, 11, 9, 10, 30), 1]]
                }
            ],
            title: {
                style: {
                    color: 'rgb(171, 171, 171)',
                    fontSize: 'small'
                },
                text: ''
            },
//        xAxis: {currentMin: 0, currentMax: 10, minRange: 1},
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    day: '%b%e日',
//            hour: '%b/%e %H:%M',
                    hour: '%H:%M',
                    minute: '%b%e日 %H:%M',
                    month: '%b %y',
                    week: '%b%e日'
                }
                //minRange: 60*60*1000
            },

            yAxis: {
                title: {text: ""},

                labels: {
                    format: '{value}lux'
                }
            },
            loading: false
        }

        self.initUserChartConfig = function (dev_uuid, type) {

            var newConfig = {
                tooltip: {
                    backgroundColor: '#FCFFC5',

                    crosshairs: {
                        width: 1,
                        color: 'gray',
                        dashStyle: 'shortdot'
                    }

                },

                options: {
                    chart: {
                        type: 'line',
                        zoomType: 'x'
                    },

                    credits: {
                        enabled: false
                    },
                    legend: {
                        enabled: false
                    },
                    tooltip: {
                        backgroundColor: '#FCFFC5',
                        crosshairs: {
                            width: 1,
                            color: 'gray',
                            dashStyle: 'shortdot'
                        }
                    }
                },

                series: [
                    {
                        name: "_",
                        color: "rgb(134, 179, 174)",
                        //pointStart: Date.UTC(2014, 0, 29),
                        //pointInterval: 3600 * 1000,
                        data: [[Date.UTC(2015, 11, 9, 01, 15), 0], [Date.UTC(2015, 11, 9, 02, 20), 0], [Date.UTC(2015, 11, 9, 03, 30), 0],
                            [Date.UTC(2015, 11, 9, 04, 35), 0], [Date.UTC(2015, 11, 9, 05, 40), 0], [Date.UTC(2015, 11, 9, 06, 45), 0], [Date.UTC(2015, 11, 9, 07, 50), 0],
                            [Date.UTC(2015, 11, 9, 08, 30), 0], [Date.UTC(2015, 11, 9, 09, 30), 0], [Date.UTC(2015, 11, 9, 10, 30), 0]]
                    }
                ],
                title: {
                    style: {
                        color: 'rgb(171, 171, 171)',
                        fontSize: 'small'
                    },
                    text: ''
                },

                xAxis: {
                    type: 'datetime',
                    dateTimeLabelFormats: {
                        day: '%b%e日',
                        hour: '%H:%M',
                        minute: '%b%e日 %H:%M',
                        month: '%b %y',
                        week: '%b%e日'
                    }
                },

                yAxis: {
                    title: {text: ""},
                    labels: {
                        format: '{value} %RH'
                    }
                },

                loading: false
            }

            self._chartOptionForUser[dev_uuid + type] = newConfig
        }

        self.getAllUserChartConfig = function () {
            return self._chartOptionForUser
        }

        self.getChartConfigForUser = function (dev_uuid, stype) {

            if (!_.has(self._chartOptionForUser, dev_uuid, stype)) {
                self._chartOptionForUser[dev_uuid + stype] = {
                    tooltip: {
                        backgroundColor: '#FCFFC5'
                    },

                    options: {
                        chart: {
                            type: 'line',
                            zoomType: 'x'
                        },

                        credits: {
                            enabled: false
                        },
                        legend: {
                            enabled: false
                        }
                    },

                    series: [
                        {
                            name: "_",
                            color: "rgb(94, 169, 111)",
                            pointStart: Date.UTC(2013, 0, 29),
                            pointInterval: 3600 * 1000,
                            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                        }
                    ],
                    title: {
                        style: {
                            color: 'rgb(171, 171, 171)',
                            fontSize: 'small'
                        },
                        text: '---'
                    },
//        xAxis: {currentMin: 0, currentMax: 10, minRange: 1},
                    xAxis: {
                        type: 'datetime',
                        dateTimeLabelFormats: {
                            day: '%b%e日',
//            hour: '%b/%e %H:%M',
                            hour: '%H:%M',
                            minute: '%b%e日 %H:%M',
                            month: '%b %y',
                            week: '%b%e日'
                        }
//          minRange: 60*60*1000
                    },

                    yAxis: {
                        minColor: 'red',
                        maxColor: 'yellow',
                        tickInterval: 5,
                        title: {text: ""},
                        gridLineDashStyle: 'longdash',

                        labels: {
                            format: '{value} bla'
                        }
                    },

                    loading: false
                }
            }
            return self._chartOptionForUser[dev_uuid + stype]
        }

        self.updateChartType = function (ctype) {
            //self.humidity_chartOptionForTemp.options.chart.type = ctype
            self.temperature_chartOptionForTemp.options.chart.type = ctype
            self.lux_chartOptionForTemp.options.chart.type = ctype
        }

        self.setTitle = function (title) {
            self.temperature_chartOptionForTemp.title.text = title
            self.lux_chartOptionForTemp.title.text = title
        }

        self.getChartOption = function (stype) {
            if ("temperature" == stype) {
                return self.temperature_chartOptionForTemp
            }else if ("lux" == stype) {
                return self.lux_chartOptionForTemp
            }
            //      return self._chartOption
        }

        //processing date
        var processing = function (el) {
            var air_temperature_data = [];
            var air_temperature = [];


            _.forEach(el, function (data) {

                var time = new Date(data.time);

                //query curve time and historical data
                air_temperature = [Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes()), data.value]
                air_temperature_data.push(air_temperature);
            })
            return air_temperature_data;
        }

        self.updateChartData = function (chartData) {

            if (chartData.air_temperature !== undefined) {

                //air_temperature
                var charData_temperature = {}//曲线数据
                charData_temperature.data = processing(chartData.air_temperature)
                //更新曲线配置
                _.extend(self.temperature_chartOptionForTemp.series[0], charData_temperature)
                _.extend(self.temperature_chartOptionForTemp.series[0].color = "#FF0000")

            }
            if (chartData.air_humidity !== undefined) {

                //humidity
                var charData_humindity = {};
                charData_humindity.data = processing(chartData.air_humidity);
                console.log(charData_humindity.data,"111111");
                _.extend(self.temperature_chartOptionForTemp.series[1], charData_humindity)
                _.extend(self.temperature_chartOptionForTemp.series[1].color = "#32C3FD")
            }
            if (chartData.lux !== undefined) {

                //lux
                var charData_lux = {};
                charData_lux.data = processing(chartData.lux);
                console.log(charData_lux.data,"111111");
                _.extend(self.lux_chartOptionForTemp.series[0], charData_lux)
                _.extend(self.lux_chartOptionForTemp.series[0].color = "#FFB577")
                _.extend(self.lux_chartOptionForTemp.yAxis.labels.format = '{value} lux')
            }
        }

        self.updateData = function (data) {
            self._chartOption.series[0].data = data
        }


        self.setStartDateTime = function (datetime) {
            self._year = datetime.getFullYear()
            self._mon = datetime.getMonth()
            self._day = datetime.getDate()
            self._min = datetime.getMinutes()
            self._sec = datetime.getSeconds()
        }

        self.changeStyle = function (style) {
            self._chartOption.options.chart.type = style
        }

        self.changeYaxis = function (sig) {
            if ("corr" == sig) {
                self._chartOption.yAxis.labels.format = '{value}'
                self._chartOption.yAxis.min = -1
                self._chartOption.yAxis.max = 1
                console.debug("changeYaxis: ", sig)
            } else if ("snr" == sig) {
                self._chartOption.yAxis.labels.format = '{value} dB'
                self._chartOption.yAxis.min = 0
                self._chartOption.yAxis.max = 40
                console.debug("changeYaxis: ", sig)
            } else if ("rssi" == sig) {
                self._chartOption.yAxis.labels.format = '{value} dB'
                self._chartOption.yAxis.min = 0
                self._chartOption.yAxis.max = 50
                console.debug("changeYaxis: ", sig)
            }
        }

        self.updateChart = function () {
            var tmp
            console.log("updateChart")
            var fake = []
            _.times(20, function () {
                fake.push(Math.floor(Math.random(40) * 100))
            })

//      console.log("fake: ", fake)

            self._chartOption.series[0].data = fake
        }

        self.updateData = function (data) {
            self._chartOption.series[0].data = data
        }

        self.clearData = function () {
            self._chartOption.series = []
        }

        self.addData = function (data) {
            _.remove(self._chartOption.series, function (el) {
                return el.__uniqueIndex == "____"
            })

            self._chartOption.series.push(data)
        }

        self.hideData = function (dev_uuid, component_id, freq, scope) {

//      console.error("========== fucking hideData =========")
//      return false

            var uniqueIndex = dev_uuid + "_" + component_id + "_" + freq
            var uniqueIndexWithScope = dev_uuid + "_" + component_id + "_" + freq + "_" + scope

            console.log("## hideData", uniqueIndex)

            _.remove(self._chartOption.series, function (el) {
                return _.isUndefined(el)
            }) // remove the init one

            var targetIndex = _.findIndex(self._chartOption.series, function (el) {
                return el.__uniqueIndex == uniqueIndex
            })

//      console.warn("## targetIndex", targetIndex)
            self.dataCache[uniqueIndexWithScope] = self._chartOption.series[targetIndex]

            _.remove(self._chartOption.series, function (el) {
                return el.__uniqueIndex == uniqueIndex
            })

            if (0 == self._chartOption.series.length) {
                self._chartOption.series.push({
                    name: "initdata",
                    marker: {
                        fillColor: '#FFFFFF',
                        lineWidth: 1,
                        lineColor: null,
                        symbol: "circle",
                        radius: 3
                    },
//          color: "rgb(94, 169, 212)",
                    color: "rgb(94, 169, 212)",
                    __uniqueIndex: "____",
                    pointStart: Date.UTC(self._year, self._mon, self._day, self._min, self._sec),
//          pointInterval: 3600 * 1000 * 24,
                    pointInterval: 3600 * 1000,
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                })

            }
        }

        self.showData = function (dev_uuid, component_id, freq, scope) {
//      console.error("=========== fuck ============== showData: ", self.dataCache)

            if (!_.isEmpty(self.dataCache)) {
                _.remove(self._chartOption.series, function (el) {
                    return _.isUndefined(el)
                }) // remove the init one

                self._chartOption.series.push(self.dataCache[dev_uuid + "_" + component_id + "_" + freq + "_" + scope])
            }

        }

    }])

