var app = getApp()
var util = require('../../utils/util.js')
var that
// Image.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    result: '请选择图片',
    images: [],
    imageWidth: 160,
    comment: '',
    commentAvatar: ''
  },
  chooseImages: function () {
    util.checkLoginForWeChat()
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        that.setData({
          images: that.data.images.concat(tempFilePaths)
        })
        util.messageToView(that, '请点击发布', false)
        //upload(images)
      }
    })
  },
  publish: function () {
    var tempFilePaths = this.data.images
    if (util.isStringEmpty(this.data.comment) && (tempFilePaths == null || tempFilePaths.length == 0)) {
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
        commentType: app.globalData.WECHAT_IMAGE,
        content: util.html2Escape(this.data.comment)
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': app.globalData.cookie
      },
      success: function (res) {
        if (util.checkActionResult(res) == false){
          util.messageToView(that, res.data.message, true)
          wx.hideLoading()
          util.showDialog('错误', '发布失败！')
          return
        }
        var commentId = JSON.parse(util.escape2Html(res.data.message))
        //这里判断返回值
        //上传文件
        upload(tempFilePaths, commentId)
      },
      fail: function (res) {
        wx.hideLoading()
        util.showDialog('错误','发布失败！')
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
  delete: function (e) {
    var index = e.currentTarget.dataset.index;
    var images = that.data.images;
    images.splice(index, 1);
    that.setData({
      images: images
    })
  },
  previewImage: function (event) {
    // 预览图集
    var index = event.currentTarget.dataset.index
    var path = that.data.images[index]
    wx.previewImage({
      current: path,
      urls: that.data.images
    });
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  }
})

function upload(tempFilePaths, commentId) {
  if (tempFilePaths == null || tempFilePaths.length == 0) {
    that.setData({
      comment: '',
      commentAvatar: ''
    })
    wx.hideLoading()
    util.messageToView(that, '发布成功，但未选择图片', true)
    util.uploadFinish('../Image/Image?id=请选择图片')
  } else {
    doUploadImage(tempFilePaths, commentId)
  }
}

function doUploadImage(tempFilePaths, commentId) {
  wx.uploadFile({
    url: app.globalData.serverAddr + 'admin/schplActivity/doUpload.do',
    filePath: tempFilePaths.shift(),
    name: 'file',
    formData: {
      'path': app.globalData.uploadImagePath,
      'uploader': app.globalData.cmsUser.id,
      'uploaderName': app.globalData.cmsUser.name,
      'attachType': app.globalData.WECHAT_IMAGE,
      'activityId': commentId
    },
    header: {
      'content-type': 'multipart/form-data',
      'Cookie': app.globalData.cookie
    },
    success: function (res) {
      var data = JSON.parse(res.data)
      util.messageToView(that, '\nsuccess: ' + data.message, true)
      //算是递归调用吧
      if (tempFilePaths != null && tempFilePaths.length > 0) {
        doUploadImage(tempFilePaths, commentId)
      }else{
        //这里才算是已经结束了
        wx.hideLoading()
        //提示成功
        util.uploadFinish('../Image/Image?id=请选择图片')
      }
    },
    fail: function (res) {
      wx.hideLoading()
      util.messageToView(that, '\nfail: ' + res.errMsg, true)
    },
    complete: function (res) {
      that.setData({
        images: tempFilePaths,
        comment: '',
        commentAvatar: ''
      })
      util.messageToView(that, '\ncomplete: ' + res.errMsg, true)
    }
  })
}