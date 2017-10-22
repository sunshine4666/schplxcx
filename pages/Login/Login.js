var app = getApp()
var util = require('../../utils/util.js')
Page({
  data: {
    userInfo: {},
    result: "请点击登录",
    cmsUsername: null,
    cmsPassword: null
  },
  onLoad: function (options) {
    var that = this
    that.setData({
      userInfo: app.globalData.userInfo,
      cmsUsername: app.globalData.cmsUsername,
      cmsPassword: app.globalData.cmsPassword
    })

    console.log(that.data.cmsUsername);

    var isAutoLogin = Boolean(options.isAutoLogin)
    if (isAutoLogin){
      that.toLogin();
    }
  }, 
  toLogin: function () {
    var that = this
    if (that.data.cmsUsername != null && that.data.cmsUsername != '')
      app.globalData.cmsUsername = that.data.cmsUsername
    if (that.data.cmsPassword != null && that.data.cmsPassword != '')
      app.globalData.cmsPassword = that.data.cmsPassword
    //开始登录
    that.setData({
      result: '正在登录..'
    })
    login()
    //getData(app.globalData.cookie)
  },
  cmsUsernameInput: function (e) {
    this.setData({
      cmsUsername: e.detail.value
    })
  },
  cmsPasswordInput: function (e) {
    this.setData({
      cmsPassword: e.detail.value
    })
  },
  refresh: function () {
    wx.redirectTo({
      url: '../Login/Login'
    })
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  }
})

function login() {
  wx.showLoading({
    title: '正在登录...',
  })

  console.log(app.globalData.cmsUsername);
  var page = util.getCurrentPage()
  wx.request({
    url: app.globalData.serverAddr + 'admin/loginWebChat.do',
    data: {
      username: app.globalData.cmsUsername,
      password: app.globalData.cmsPassword
    },
    method: 'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded' //这是一个坑，否则无法获取cookie
    },
    success: function (res) {

      var data = res.data
      //打印数据
      page.setData({
        result: '\nsuccess: '+ data.message
      })
      //检测登录状态
      if (data.message == '操作成功'){
        //登录（绑定）成功，就转到首页。应该是获取完整的用户信息再转
        //goBackToComment()
        //设置cookie、更新缓存
        app.globalData.cookie = res.header['Set-Cookie']
        wx.setStorageSync('cmsUsername', app.globalData.cmsUsername)
        wx.setStorageSync('cmsPassword', app.globalData.cmsPassword)
        wx.setStorageSync('cookie', app.globalData.cookie)
        //获取cms用户信息
        getCmsUserInfo()
      }
      else{
        //do sth
      }
    },
    fail:function(res){
      page.setData({
        result: page.data.result + '\nfail: ' + res.errMsg
      })
      util.showDialog('错误', '登录失败！')
    },
    complete: function (res) {
      wx.hideLoading()
      page.setData({
        result: page.data.result + '\ncomplete: ' + res.errMsg
      })
    }
  })
}

function goBackToComment(){
  var currentPages = getCurrentPages()
  if (currentPages.length <= 1){
    wx.redirectTo({
      url: '../Comment/Comment'
    })
  }else{
    wx.reLaunch({
      url: '../Comment/Comment',
    })
  }
}

function getCmsUserInfo() {
  console.log(app.globalData.cookie);
  wx.request({
    url: app.globalData.serverAddr + "/admin/schplWeChat/getCmsUserInfo.do",
    method: 'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Cookie': app.globalData.cookie
    },
    success: function (res) {
      console.log(res);
      if (res.data.message == null) {
        util.showDialog("提示", "无法获取用户数据！")
        return
      }
      var data = JSON.parse(util.escape2Html(res.data.message))
      if (data != null) {
        app.globalData.cmsUser = data
        wx.setStorageSync('cmsUser', data)
      }
      //登录（绑定）成功，获取cmsUser信息成功
      goBackToComment()
    },
    fail: function (res) {
    },
    complete: function (res) {
    }
  })
}