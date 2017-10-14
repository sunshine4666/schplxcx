//app.js
App({
  onLaunch: function () {
    var that = this
    //登录微信，将信息传入globalData
    wx.login({
      success: function () {
        wx.getUserInfo({
          success: function (res) {
            that.globalData.userInfo = res.userInfo
          }
        })
      }
    })
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    //wx.setStorageSync('logs', logs)
    //从缓存中加载数据
    var cmsUsername = wx.getStorageSync('cmsUsername')
    var cmsPassword = wx.getStorageSync('cmsPassword')
    if (cmsUsername != null && cmsUsername != '')
      that.globalData.cmsUsername = cmsUsername
    if (cmsPassword != null && cmsPassword != '')
      that.globalData.cmsPassword = cmsPassword
    //加载cookie
    that.globalData.cookie = wx.getStorageSync('cookie')
    //加载其他数据
    that.globalData.cmsUser = wx.getStorageSync('cmsUser')
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData:{
    userInfo:null,
    cookie:null,
    //serverAddr:'http://10.3.93.200/schpl/',
    //serverAddr: 'http://192.168.4.37/schpl/',
    //serverAddr: 'http://wisdom.gzjkw.net/schpl/',
    serverAddr: 'http://localhost:8888/schpl/',
    //serverAddr: 'https://xcx.gzjkw.net/schpl/',
    cmsUsername: null,
    cmsPassword: null,
    cmsUser: null,
    WECHAT_VIDEO: 5,
    WECHAT_IMAGE: 6,
    WECHAT_BG: 7,
    uploadVideoPath: '/WeChatSource/Video',
    uploadImagePath: '/WeChatSource/Image',
    uploadHeadBGPath: '/WeChatSource/HeadBG'
  }
})