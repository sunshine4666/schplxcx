// Zone.js
var util = require('../../utils/util.js')
var app = getApp()
var zonePageIndex = 1
var isEnd = false
var zonePageSize = 10
var that
Page({
  /**
   * 页面的初始数据
   */
  data: {
    comments: [],
    WECHATVIDEO: app.globalData.WECHAT_VIDEO,
    WECHATIMAGE: app.globalData.WECHAT_IMAGE,
    uploader: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this
    that.setData({
      uploader: app.globalData.cmsUser.id
    })
    zonePageIndex = 1
    isEnd = false
    this.getSource()
  },
  getSource: function () {
    if (isEnd) {
      /*wx.showLoading({
        title: '没有更多了',
      })
      setTimeout(function () {
        wx.hideLoading()
      }, 2000)*/
      util.showDialog('提示', '没有更多了')
      return
    }
    //util.checkLoginForWeChat(false)
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.serverAddr + "/admin/schplWeChat/getCommentList.do",
      data: {
        uploader: app.globalData.cmsUser.id,
        //commentType: app.globalData.WECHAT_IMAGE,
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
        //超时判断:重定向结束之后，res.data还是有数据的
        var responseCookie = res.header['Set-Cookie']
        if (!util.isStringEmpty(responseCookie) && app.globalData.cookie != responseCookie) {
          /*wx.showModal({
            title: '提示',
            content: '获取数据错误！',
            showCancel: false,
            complete: function (res) {
              util.checkLoginForWeChat(false)
            }
          })*/
          util.checkLoginForWeChat(false)
          return
        }
        var data
        try {
          //原先json有问题，捕捉
          data = JSON.parse(util.escape2Html(res.data.message))
          //解析数据为空，捕捉
          if (data == null) {
            throw 'error'
          }
        } catch (e) {
          //原先json有问题
          var msg = '第' + zonePageIndex.toString() + '页数据有误。是否继续？'
          zonePageIndex++
          if (zonePageIndex > res.data.callbackType) {
            isEnd = true
          } else {
            isEnd = false
          }
          wx.showModal({
            title: '提示',
            content: msg,
            success: function (res) {
              if (res.confirm) {
                that.getSource()
              } else {
                return
              }
            }
          })
          return
        }

        if (res.data.rel == 'true') { //尾页问题解决
          isEnd = true
        } else {
          isEnd = false
        }
        (data || []).map(function (entity) {
          entity.createDate = util.compareDate(entity.createDate)
          //将内容转义
          entity.content = util.escape2Html(entity.content)
          /*entity.createDate = util.formatTime(new Date(entity.createDate))
          entity.createDate = new Date(entity.createDate)*/
          return entity
        })
        //console.log(data);
        that.setData({
          comments: that.data.comments.concat(data)
        })
        //模拟翻页刷新
        zonePageIndex++
      },
      fail: function (res) {
        util.checkLoginFinish('无法连接到服务器！')
      },
      complete: function (res) {
        //do sth
        wx.hideLoading()
      }
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getSource()
  },
  previewCurrentImage: function (event) {
    //console.log(event.currentTarget.dataset.path)
    var source = event.currentTarget.dataset.source
    var index = event.currentTarget.dataset.index
    var paths = []
    source.forEach(function (entity) {
      paths.push(entity.path)
    })
    var path = paths[index]
    wx.previewImage({
      current: path,
      urls: paths
    })
  },
  onPullDownRefresh: function () {
    wx.redirectTo({
      url: '../MyComment/MyComment'
    })
  },
  deleteComment: function (event) {
    wx.showModal({
      title: '提示',
      content: '确定删除？',
      success: function (res) {
        if (res.confirm) {
          //删除朋友圈
          var id = event.currentTarget.dataset.id;
          var commentids = []
          commentids.push(id)
          wx.request({
            url: app.globalData.serverAddr + "/admin/schplWeChat/delete.do",
            data: {
              commentids: commentids
            },
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded',
              'Cookie': app.globalData.cookie
            },
            success: function (res) {
              /*wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
              })*/
              util.showDialog('提示', '删除成功！')
              var index = event.currentTarget.dataset.index;
              var comments = that.data.comments;
              comments.splice(index, 1);
              that.setData({
                comments: comments
              });
            },
            fail: function (res) {
              util.showDialog('错误', '删除失败！')
            }
          })
        }
      }
    })
  },
  videoPlayControl: function (event) {
    var current = event.currentTarget.dataset.id;
    if (this.videoContext != null) {
      var original = this.videoContext.domId
      if (original != current) {
        this.videoContext.pause()
        this.videoContext = wx.createVideoContext(current)
      }
    } else {
      this.videoContext = wx.createVideoContext(current)
    }
  }
})