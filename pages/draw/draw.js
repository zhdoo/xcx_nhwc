//获取应用实例
const app = getApp()
const ctx = wx.createCanvasContext('firstCanvas')

var types = ['default', 'primary', 'warn']
Page({
  data: {
    animationData: {},
    defaultSize: 'default',
    primarySize: 'default',
    warnSize: 'default',
    disabled: false,
    plain: false,
    loading: false,
    pageWidth:null,
    userInfo:null,
    penColor:'#000000',
    penWidth:4,
    showCanvas:true,
    penList:[
      {'size':8},
      { 'size': 20 },
      { 'size': 32 },
      { 'size': 48 },
    ],
    colorList:[
      {'color':"#000000"},
      { 'color': "#ff0000" },
      { 'color': "#ffff00" },
      { 'color': "#00ff00" },
      { 'color': "#0000ff" },
      { 'color': "#00FFFF" },
      { 'color': "#000066" },
      { 'color': "#006666" },
      { 'color': "#660000" },
      { 'color': "#990099" },
      { 'color': "#CC6600" },
      { 'color': "#CCCCCC" },
      { 'color': "#FF00FF" },
      { 'color': "#CCFF00" },
      { 'color': "#FFCC00" },
      { 'color': "#FFCCCC" },
    ],
    selectColorIdx:0,
    selectPenIdx: 0,
    isClear: false, //是否启用橡皮擦标记

  },
  startX: 0, //保存X坐标轴变量
  startY: 0, //保存X坐标轴变量
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    var that=this;
    wx.getUserInfo({
      success: res => {
        app.globalData.userInfo = res.userInfo
        that.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
    wx.setStorage({
      key: "backList",
      data: []
    })
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    })


    that.animation = animation

   
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          pageWidth: res.windowWidth
        })
        // console.log(res.model)
        // console.log(res.pixelRatio)
        // console.log(res.windowWidth)
        // console.log(res.windowHeight)
        // console.log(res.language)
        // console.log(res.version)
        // console.log(res.platform)
      }
    })
    
    wx.getStorage({
      key: 'oldPic',
      success: function (r) {
        wx.showModal({
          title: '',
          content: '还有未完成的画作，是否加载',
          success: function (res) {
            if (res.confirm) {
              console.log(that.data.pageWidth)
              console.log(r.data)
              ctx.drawImage(r.data, 0, 0, that.data.pageWidth, 300)
              ctx.draw(true)
              wx.setStorage({
                key: "initImage",
                data: r.data
              })
            } else if (res.cancel) {
              wx.getStorage({
                key: "initImage",
                success:function(){
                  wx.removeStorage({
                    key: 'initImage',
                    success: function(res) {},
                  })
                }
              })
            }
          }
        })
      }
    })


  },
  clear: function () {
    
    let isClear = this.data.isClear ? false : true
    let color
    if(isClear){
      color = "#FFFFFF"
    }else{
      color = this.data.colorList[this.data.selectColorIdx].color
    }
    console.log(color)

    this.setData({
      penColor: color,
      isClear: isClear,
    })
 
  },
  touchStartLine: function (e) {
  
    this.startX = e.touches[0].x
    this.startY = e.touches[0].y
    if (this.data.isClear == true) { //判断是否启用的橡皮擦功能 ture表示清除 false表示画画
      ctx.setStrokeStyle('#FFFFFF') //设置线条样式 此处设置为画布的背景颜色 橡皮擦原理就是：利用擦过的地方被填充为画布的背景颜色一致 从而达到橡皮擦的效果
      ctx.setLineCap('round') //设置线条端点的样式
      ctx.setLineJoin('round') //设置两线相交处的样式
      ctx.setLineWidth(this.data.penWidth) //设置线条宽度
      ctx.save(); //保存当前坐标轴的缩放、旋转、平移信息
      ctx.beginPath() //开始一个路径
    
    } else {
      ctx.setStrokeStyle(this.data.penColor)
      ctx.setLineWidth(this.data.penWidth)
      ctx.setLineCap('round') // 让线条圆润
      ctx.beginPath()
    }
  },
  touchMoveLine: function (e) {
    console.log(this.data.isClear)
    var startX1 = e.touches[0].x
    var startY1 = e.touches[0].y
    if (this.data.isClear==true) { //判断是否启用的橡皮擦功能 ture表示清除 false表示画画
      ctx.save(); //保存当前坐标轴的缩放、旋转、平移信息
      ctx.moveTo(this.startX, this.startY); //把路径移动到画布中的指定点，但不创建线条
      ctx.lineTo(startX1, startY1); //添加一个新点，然后在画布中创建从该点到最后指定点的线条
      ctx.stroke(); //对当前路径进行描边
      ctx.restore() //恢复之前保存过的坐标轴的缩放、旋转、平移信息
      this.startX = startX1;
      this.startY = startY1;
    } else {
      console.log(this.data.penColor)
      console.log(this.data.penWidth)
      ctx.moveTo(this.startX, this.startY)
      ctx.lineTo(startX1, startY1)
      ctx.stroke()
      this.startX = startX1;
      this.startY = startY1;
    }
    ctx.draw(true)
  },
  touchEndLine: function (e) {
    var that = this;
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: that.data.pageWidth,
      height: 300,
      destWidth: that.data.pageWidth,
      destHeight: 300,
      canvasId: 'firstCanvas',
      success: function (res) {
        // 将用户每一次touchend的画布图片缓存到一个列表 
        wx.getStorage({
          key: 'backList',
          success: function(re) {
            var backList=re.data;
            backList.push(res.tempFilePath)
            wx.setStorage({
              key: "backList",
              data: backList
            })
            console.log(re)
          },
        })

        wx.setStorage({
          key: "oldPic",
          data: res.tempFilePath
        })
      }
    })
  },
  setColor: function (e) {
    
    var color = e.currentTarget.dataset.color;
    var index = e.currentTarget.dataset.idx;
    this.setData({
      isClear:false,
      penColor:color,
      selectColorIdx:index
    })
  },
  setWidth: function (e) {
    var width = e.currentTarget.dataset.width;
    var index = e.currentTarget.dataset.idx;
   
    this.setData({
      penWidth:width,
      selectPenIdx: index
    })
  },
  clearAll: function () {
    var that = this;

    
    ctx.setFillStyle('#FFFFFF')
    ctx.fillRect(0, 0, that.data.pageWidth, 300)
    ctx.draw()
    wx.removeStorage({
      key: 'oldPic',
      success: function (res) {
        console.log(res.data)
      }
    })
    wx.removeStorage({
      key: 'backList',
      success: function (res) {
        console.log(res.data)
      }
    })
  },
  //返回涂鸦上一步  
  backOne:function(){
    var that=this;
    wx.getStorage({
      key: 'backList',
      success: function (re) {
        var backList = re.data;
        var backLength = backList.length;
  
        if (backLength>0){
          var backIndex = backLength - 1
          backList.splice(backIndex, 1)
          if(backLength==1){
            wx.getStorage({
              key: "initImage",
              success: function(e){
                console.log(e.data)
                ctx.drawImage(e.data, 0,0, that.data.pageWidth, 300)
                ctx.draw()
              },
              fail:function(e){
                // console.log(123)
                ctx.setFillStyle('#FFFFFF')
                ctx.fillRect(0, 0, that.data.pageWidth, 300)
                ctx.draw()
              }
            })
            wx.removeStorage({
              key: 'backList',
              success: function (res) {
                // console.log(res.data)
              }
            })
          }else{
            var backImage = backList[backIndex - 1]
              // console.log(backImage)
              ctx.drawImage(backImage, 0, 0, that.data.pageWidth, 300)
              ctx.draw()
              wx.setStorage({
                key: "oldPic",
                data: backImage
              })
          }
          wx.setStorage({
            key: 'backList',
            data: backList,
          })
        }else{
          ctx.setFillStyle('#FFFFFF')
          ctx.fillRect(0, 0, that.data.pageWidth, 300)
          ctx.draw()
          wx.removeStorage({
            key: 'initImage',
            success: function (res) { },
          })
        }
       
      },
    })
  },
  showQuestionForm:function(){
    let showForm = this.data.showCanvas==false?true:false;
    this.setData({
      showCanvas:showForm
    })
  },
  touchStartBtn:function(e){
    console.log(e)
  }
})
