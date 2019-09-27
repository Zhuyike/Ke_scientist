
var login_failed_dict = {'type1': '您未开通珂学家系统权限\n如有必要请@五彩斑斓的金毛开通权限',
                           'type2': '登录失败请重新再来',
                           'type3': '您已在申请列表中\n请@五彩斑斓的金毛开通权限'};
$.download = function (url, json) {
    var $form = $("<form id='__download__' class='hidden' method='post'></form>");
    $form.attr('action', url);
    $(body).append($form);
    var key;
    for (key in json) {
        var $input = $("<input type='text'>");
        $input.attr('name', key);
        $input.attr('value', json[key]);
        $("#__download__").append($input)
    }
    $form.submit()
};
function fetch_failed(data) {
    alert('操作失败，失败信息：' + data['msg']);
    if (data['msg'] === '登录信息已失效') {
        window.location = '/login';
    }
}
$('.fetch-time').datetimepicker({
    language:  'zh-CN',
    autoclose: 1
});