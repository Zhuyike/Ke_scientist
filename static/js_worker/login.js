$(function () {
   $('.input_login').on('click', function () {
       var pwd = $('.pwd_login').val();
       var username = $('.username_login').val();
       var next_ = $('#next__').val();
       var user = {
           'username': username,
           'password__': $.md5(pwd)
       };
       user = JSON.stringify(user);
       $.ajax('/api/login', {
           'method': 'POST',
           'contentType': 'application/json',
           'data': user,
           'dataType': 'json'
       }).done(function (data) {
           if (data['login'] === 'success'){
               if (confirm(data['msg'] + '\n登录成功，点击确定后跳转')){
                   window.location = next_;
               }
           }else{
               alert('登录失败，失败信息：' + data['msg']);
           }
       }).fail(function (xhr, status) {
           console.log('失败: ' + xhr.status + ', 原因: ' + status);
       })
   });
   var failed = $('#failed__').val();
   if (failed.length !== 0) {
       alert(login_failed_dict[failed])
   }
});