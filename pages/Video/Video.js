var app = getApp()
var util = require('../../utils/util.js')
var that 
// Video.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    result: '请选择视频',
    tempFilePath: '',
    comment:'',
    commentAvatar:''
  },
  chooseVideo: function () {
    util.checkLoginForWeChat()
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: function (res) {
        //显示
        var tempFilePath = res.tempFilePath
        that.setData({
          tempFilePath: tempFilePath
        })
        util.messageToView(that, '请点击发布', false)
        //upload(tempFilePath)
      }
    })
  },
  publish: function(){
    var tempFilePath = this.data.tempFilePath
    if (util.isStringEmpty(this.data.comment) && util.isStringEmpty(tempFilePath)){
      util.showDialog('错误', '内容为空！')
      return
    }
    util.messageToView(that, '执行结果：', false)
    wx.showLoading({
      title: '请稍后',
    })
    wx.request({
      url: app.globalData.serverAddr + "/admin/schplWeChat/save.do",
      data: {
        uploader: app.globalData.cmsUser.id,
        uploaderName: app.globalData.cmsUser.name,
        uploaderNickName: app.globalData.cmsUser.nickName,
        commentType: app.globalData.WECHAT_VIDEO,
        content: util.html2Escape(this.data.comment)
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': app.globalData.cookie
      },
      success: function (res) {
        if (util.checkActionResult(res) == false) {
          util.messageToView(that, res.data.message, true)
          wx.hideLoading()
          util.showDialog('错误', '发布失败！')
          return
        }
        var commentId = JSON.parse(util.escape2Html(res.data.message))
        //这里判断返回值
        //上传文件
        upload(tempFilePath, commentId)
      },
      fail: function (res) {
        wx.hideLoading()
        util.showDialog('错误', '发布失败！')
      }
    })
  },
  commentInput: function (e) {
    this.setData({
      comment: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this
    util.messageToView(that, options.id, false)
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  }
})

function upload(tempFilePath,commentId){
  if (tempFilePath == null || tempFilePath == ''){
    that.setData({
      comment: '',
      commentAvatar: ''
    })
    wx.hideLoading()
    util.messageToView(that, '发布成功，但未选择视频', true)
    util.uploadFinish('../Video/Video?id=请选择视频')
  }else{
    doUploadVideo(tempFilePath, commentId)
  }
}

function doUploadVideo(tempFilePath, commentId){
  wx.uploadFile({
    url: app.globalData.serverAddr + 'admin/schplActivity/doUpload.do',
    filePath: tempFilePath,
    name: 'file',
    formData: {
      'path': app.globalData.uploadVideoPath,
      'uploader': app.globalData.cmsUser.id,
      'uploaderName': app.globalData.cmsUser.name,
      'attachType': app.globalData.WECHAT_VIDEO,
      'activityId': commentId
    },
    header: {
      'content-type': 'multipart/form-data',
      'Cookie': app.globalData.cookie
    },
    success: function (res) {
      var data = JSON.parse(res.data)
      util.messageToView(that, '\nsuccess: ' + data.message, true)
      //提示成功
      util.uploadFinish('../Video/Video?id=请选择视频')
    },
    fail: function (res) {
      util.messageToView(that, '\nfail: ' + res.errMsg, true)
    },
    complete: function (res) {
      that.setData({
        tempFilePath: '',
        comment: '',
        commentAvatar: ''
      })
      wx.hideLoading()
      util.messageToView(that, '\ncomplete: ' + res.errMsg, true)
    }
  })
}