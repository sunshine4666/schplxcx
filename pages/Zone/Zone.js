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
    images:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    zonePageIndex = 1
    isEnd = false
    this.getSource()
  },
  getSource: function(){
    if (isEnd){
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
        //uploaderName: app.globalData.cmsUsername,
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
        if (data.length < zonePageSize){  //todo:这个判断是有隐患的，如果最后一页刚好是这个数，无限可以刷
          isEnd = true
        }else{
          isEnd = false
        }
        (data || []).map(function(entity){
          entity.createDate = util.formatTime(new Date(entity.createDate))
          return entity })
        console.log(data);
        page.data.images = page.data.images.concat(data)
        page.setData({
          images: page.data.images
        })
        //模拟翻页刷新
        zonePageIndex ++
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
    this.getSource()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})