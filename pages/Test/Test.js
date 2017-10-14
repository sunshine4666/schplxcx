// Zone.js
var util = require('../../utils/util.js')
var app = getApp()
var zonePageIndex = 1
var isEnd = false
var zonePageSize = 10
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //images:[]
    array: [],
    images: []
  },
  getWeChatJson: function () {
    var page = util.getCurrentPage()
    wx.request({
      url: app.globalData.serverAddr + "/admin/schplWeChat/getCommentList.do",
      data: {
        uploaderName: app.globalData.cmsUsername,
        attachType: app.globalData.WECHAT_IMAGE,
        orderType: 'desc',
        pageIndex: zonePageIndex,
        pageSize: zonePageSize
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': app.globalData.cookie
      },
      success: function (res) {
        var data = JSON.parse(util.escape2Html(res.data.message))
        console.log(data);
        //console.log(res.data.message)
      }
    })
  },
  saveWeChatComment: function () {
    wx.request({
      url: app.globalData.serverAddr + "/admin/schplWeChat/save.do",
      data: {
        uploader: 25,
        uploaderName: app.globalData.cmsUsername,
        commentType: app.globalData.WECHAT_IMAGE,
        content: '苏祖恩suzuen123456'
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': app.globalData.cookie
      },
      success: function (res) {
        //var data = JSON.parse(util.escape2Html(res.data.message))
        //console.log(data);
        console.log(res.data)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    isEnd = false
    var jn = '[{ "message": "suzuen", "id": "1","class" :[{"num":"111"},{"num":"222"},{"num":"333"}]}, { "message": "liluochuan", "id": "2" ,"class" :[{"num":"111"},{"num":"222"},{"num":"333"}]}]'
    var data = JSON.parse(jn)
    /*var jn = '{ "message": "suzuen", "id": "1","class" :[{"num":"111"},{"num":"222"},{"num":"333"}]}'
    var jn2 = '[{"code":"111"},{"code":"222"},{"code":"333"}]'
    var list = JSON.parse(jn2)
    data.list = list
    console.log(data)*/
    this.setData({
      array: data
    })

  },
  addItem: function () {
    var arrTemp = [{ "message": "suzuen", "id": Math.random() }, { "message": "suzuen", "id": Math.random() }, { "message": "suzuen", "id": Math.random() }, { "message": "suzuen", "id": Math.random() }]
    this.data.array = this.data.array.concat(arrTemp)
    this.setData({
      array: this.data.array
    })
  },
  showLoading: function () {
    wx.showLoading({
      title: '正在加载...',
    })
  },
  hideLoading: function () {
    setTimeout(function () {
      wx.hideLoading()
    }, 2000)
  },
  getJson: function () {
    if (isEnd) {
      wx.showLoading({
        title: '没有更多了',
      })
      setTimeout(function () {
        wx.hideLoading()
      }, 2000)
      return
    }

    var page = util.getCurrentPage()
    wx.request({
      url: app.globalData.serverAddr + "/admin/schplActivity/getWeChatSource.do",
      data: {
        uploaderName: app.globalData.cmsUsername,
        attachType: app.globalData.WECHAT_IMAGE,
        orderType: 'desc',
        pageIndex: zonePageIndex,
        pageSize: zonePageSize
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': app.globalData.cookie
      },
      success: function (res) {
        var data = JSON.parse(util.escape2Html(res.data.message))
        if (data.length < zonePageSize) {
          isEnd = true
        } else {
          isEnd = false
        }
        console.log(data);
        page.data.images = page.data.images.concat(data)
        page.setData({
          images: page.data.images
        })
        //模拟翻页刷新
        zonePageIndex++
      },
      fail: function (res) {
      },
      complete: function (res) {
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getJson()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})