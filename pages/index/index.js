//index.js
//获取应用实例
var app = getApp()
var util = require('../../utils/util.js')
Page({
  data: {
    userInfo: {},
    cmsUser: {}
  },
  onLoad: function () {
    //检测登录状态
    util.checkLoginForWeChat()

    var that = this
    that.setData({
      userInfo: app.globalData.userInfo,
      cmsUser: app.globalData.cmsUser
    })

    //that.toTest()
  },
  uploadImages: function () {
    util.checkLoginForWeChat()
    wx.navigateTo({
      url: '../Image/Image?id=请选择图片'
    })
  },
  uploadVideo: function () {
    util.checkLoginForWeChat()
    wx.navigateTo({
      url: '../Video/Video?id=请选择视频'
    })
  },
  logout: function(){
    wx.showModal({
      title: '提示',
      content: '确定退出？',
      success: function (res) {
        if (res.confirm) {
          app.globalData.cookie = null
          util.checkLoginForWeChat()
        }
      }
    })
  },
  toZone: function(){
    util.checkLoginForWeChat()
    wx.navigateTo({
      url: '../Zone/Zone?id=欢迎来到多媒体空间'
    })
  },
  toComment: function () {
    util.checkLoginForWeChat()
    wx.navigateTo({
      url: '../MyComment/MyComment?id=空空如也'
    })
  },
  toTest: function () {
    util.checkLoginForWeChat()
    wx.navigateTo({
      //url: '../Test/Test'
      //url: '../Image/Image?id=转到Images页'
      //url: '../Video/Video?id=转到Video页'
      url: '../Comment/Comment?id=转到Comment页'
      //url: '../testImage/testImage'
    })
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  }
})
