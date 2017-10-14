var app = getApp()
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//方法对外开放，否则无法访问到
module.exports = {
  formatTime: formatTime,
  checkLoginForWeChat: checkLoginForWeChat,
  checkLoginFromResult: checkLoginFromResult,
  messageToView: messageToView,
  getCurrentPage: getCurrentPage,
  getData: getData,
  escape2Html: escape2Html,
  getDataPost: getDataPost,
  isStringEmpty: isStringEmpty,
  showDialog: showDialog,
  showToast: showToast,
  compareDate: compareDate,
  uploadFinish: uploadFinish,
  checkLoginFinish: checkLoginFinish,
  html2Escape: html2Escape,
  checkActionResult: checkActionResult
}

//检测登录
function checkLoginForWeChat(isShowLoading) {
  var result = false
  var that = this
  if (app.globalData.cookie == null || app.globalData.cookie == '') {
    gotoLogin()
    return result;
  }
  //登录检验
  if (isShowLoading == null || isShowLoading){
    wx.showLoading({
      title: '加载中',
    })
  }
  wx.request({
    url: app.globalData.serverAddr + 'admin/checkLoginForWeChat.do',
    header: {
      'content-type': 'application/json',
      'Cookie': app.globalData.cookie
    },
    success: function (res) {
      var data = res.data
      if (data != null && data.message == '操作成功') {
        //do sth
      } else {
        //that.checkLoginFinish('会话超时，请重新登录！')
        //实现自动登录
        wx.redirectTo({
          url: '../Login/Login?isAutoLogin=true',
        })
      }
    },
    fail: function (res) {
      that.checkLoginFinish('无法连接到服务器！')
    },
    complete: function (res) {
      //do sth
      if (isShowLoading == null || isShowLoading) {
        wx.hideLoading()
      }
    }
  })
  return result
}

function gotoLogin() {
  wx.redirectTo({
    url: '../Login/Login',
  })
}

function messageToView(page, msg, isAdd) {
  if (page == null) {
    page = getCurrentPages()[getCurrentPages().length - 1]
  }
  if (page != null && page.data.result != null) {
    page.setData({
      result: isAdd ? page.data.result + msg : msg
    })
  }
}

function getCurrentPage() {
  var page = getCurrentPages()[getCurrentPages().length - 1]
  return page
}

function checkLoginFromResult(res) {
  var data = res.data
  if (data != null && data.message == '操作成功') {
    //do sth
  } else {
    gotoLogin()
  }
}

//妈蛋，这个地方有大坑，wx.request没有同步请求的属性，回调的时候已经晚了，无法判断状态

//测试用的
function getData(path) {
  wx.request({
    url: app.globalData.serverAddr + path,
    header: {
      'content-type': 'application/json',
      'Cookie': app.globalData.cookie
    },
    success: function (res) {
      console.log(res.data.message);
      console.log(escape2Html(res.data.message));
      var data = JSON.parse(escape2Html(res.data.message))
      console.log(data);
    },
    fail: function (res) {

    },
    complete: function (res) {
    }
  })
}
//测试用的
function getDataPost(path) {
  wx.request({
    url: app.globalData.serverAddr + path,
    data: {
      uploaderName: app.globalData.cmsUsername,
      attachType: app.globalData.WECHAT_IMAGE,
      orderType: 'desc',
      pageIndex: 1,
      pageSize: 10
    },
    method: 'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded',  //麻痹，能够再坑爹点吗？为什么post方法一定要这个方法，球
      'Cookie': app.globalData.cookie
    },
    success: function (res) {
      console.log(res.data.message);
      console.log(escape2Html(res.data.message));
      var data = JSON.parse(escape2Html(res.data.message))
      console.log(data);
      return data
    },
    fail: function (res) {

    },
    complete: function (res) {
    }
  })
}

//json字符串转义字符
function escape2Html(str) {
  var arrEntities = { 'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"', 'return': '\r', 'newline': '\n', '#39': "'" };
  return str.replace(/&(lt|gt|nbsp|amp|quot|return|newline|#39);/ig, function (all, t) { return arrEntities[t]; });
}
//普通字符转换成转意符
function html2Escape(sHtml) {
  return sHtml.replace(/[<>&"\r\n\\]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', '\r': '&return;', '\n': '&newline;', '\\': '\\\\' }[c]; });
}

function isStringEmpty(str) {
  if (str == null || str == "") {
    return true
  } else {
    return false
  }
}

function showDialog(title, message) {
  wx.showModal({
    title: title,
    content: message,
    showCancel: false
  })
}

function showToast(str) {
  wx.showToast({
    title: '成功' + str,
    icon: 'success',
    duration: 2000
  })
}

function compareDate(date) {
  var now = Date.parse(new Date())
  var seconds = (now - date) / 1000
  if (seconds < 60) {
    var secs = seconds
    return '刚刚'
  } else if (seconds < 3600){
    var mins = parseInt(seconds / 60)
    return mins.toString() + '分钟前'
  }else if (seconds < 24 * 3600){
    var hours = parseInt(seconds/3600)
    return hours.toString() + '小时前'
  } else{
    var days = parseInt(seconds/(24* 3600)) + 1
    return days.toString() + '天前'
  }
}

function uploadFinish(destiny){
  wx.showModal({
    title: '提示',
    content: '发布成功！是否转到朋友圈？',
    success: function (res) {
      if (res.confirm) {
        /*wx.redirectTo({
          url: '../Comment/Comment?id=转到Comment页'
        })*/
        wx.reLaunch({
          url: '../Comment/Comment'
        })
      } else {
        wx.redirectTo({
          url: destiny
        })
      }
    }
  })
}

function checkLoginFinish(msg) {
  wx.showModal({
    title: '错误',
    content: msg,
    showCancel: false,
    success: function (res) {
      wx.redirectTo({
        url: '../Login/Login',
      })
    }
  })
}

function checkActionResult(res){
  var data = res.data;
  var statusCode = data.statusCode
  if (data != null && statusCode != null){
    if (statusCode == '200'){
      return true
    } else if (statusCode == '300'){
      return false
    }else{
      return false
    }
  }else{
    return false
  }
}

