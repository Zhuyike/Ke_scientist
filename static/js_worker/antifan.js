//anti_fans
var anti_evidence = {};
var $anti_evidence = $('#anti_evidence');
$('#anti_input_btn').on('click', function () {
    var platform = $('#anti_platform').val();
    var neckname = $('#anti_neckname').val();
    var uid = $('#anti_uid').val();
    var uptime = $('#anti_uptime').val();
    uptime = Date.parse(uptime).toString();
    uptime = uptime.substr(0,uptime.length-3);
    var reason = $('#anti_reason').val();
    var evidence_list = [];
    for (var val in anti_evidence) {
        if(anti_evidence[val] === 1) {
            evidence_list.push(val);
        }
    }
    var evidence = evidence_list.join(',');
    console.log(evidence)
});
$('#anti_file_btn').on('click', function () {
    var fileObj = $(".anti_img_input")[0].files[0];
    var form = new FormData();
    form.append("k1", "v1");
    form.append("fff", fileObj);
    $.ajax('/api/anti_fans/upload', {
        'method': 'POST',
        'contentType': false,
        'data': form,
        'processData': false
    }).done(function (data) {
        if (data['success'] === 1) {
            $('.antifan_img').attr('src', data['data']['address']);
            anti_evidence[data['data']['img']] = 1;
            var text = $anti_evidence.html();
            text += '<tr><td><img src="' + data['data']['address'] + '" height="50px" alt="123"/></td><td style="text-align:right">' +
                '<button class="btn btn-default" id="delete_evidence_btn" value=' +
                    data['data']['img'] + '>&larr; 删除</button></td></tr>';
            $anti_evidence.html(text);
        }else{
            alert('操作失败，失败信息：' + data['msg']);
        }
    });
});
$anti_evidence.on('click', 'tr td button', delete_evidence);
function delete_evidence() {
    var this_ = $(this);
    var evidence = this_.val();
    anti_evidence[evidence] = 0;
    console.log(anti_evidence);
    this_.parent('td').parent('tr').html('');
}