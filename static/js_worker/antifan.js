//anti_fans
var anti_evidence = {};
var $anti_evidence = $('#anti_evidence');
var $anti_platform = $('#anti_platform');
var $anti_neckname = $('#anti_neckname');
var $anti_uid = $('#anti_uid');
var $anti_uptime = $('#anti_uptime');
var $anti_reason = $('#anti_reason');
$('#anti_input_btn').on('click', function () {
    var platform = $anti_platform.val();
    var neckname = $anti_neckname.val();
    var uid = $anti_uid.val();
    var uptime = $anti_uptime.val();
    uptime = Date.parse(uptime).toString();
    uptime = uptime.substr(0,uptime.length-3);
    var reason = $anti_reason.val();
    var evidence_list = [];
    for (var key in anti_evidence) {
        if(anti_evidence[key] === 1) {
            evidence_list.push(key);
        }
    }
    var evidence = evidence_list.join(',');
    var anti_data = {
        'op': 1,
        'platform': platform,
        'neckname': neckname,
        'uid': uid,
        'uptime': uptime,
        'reason': reason,
        'evidence': evidence,
    };
    anti_data = JSON.stringify(anti_data);
    if ((platform.length !== 0) && (neckname.length !== 0)){
        $.ajax('/api/anti_fans/merge', {
            'method': 'POST',
            'contentType': 'application/json',
            'data': anti_data,
            'dataType': 'json'
        }).done(function (data) {
            if (data['success'] === 1) {
                alert('添加成功');
                $anti_evidence.html('');
                $anti_platform.val('');
                $anti_neckname.val('');
                $anti_reason.val('');
                $anti_uid.val('');
                anti_evidence = {};
            }else{
                alert('操作失败，失败信息：' + data['msg']);
            }
        })
    }
});
$('#anti_file_btn').on('click', function () {
    var fileObj = $(".anti_img_input")[0].files[0];
    if (fileObj === undefined) { return }
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
    this_.parent('td').parent('tr').html('');
}
var anti_list = [];
var anti_dict = {};
var anti_page = 0;
var anti_max = 0;
var anti_len = 12;
var $next_anti_a = $('#next_anti_a');
var $previous_anti_a = $('#previous_anti_a');
var $next_anti = $('#next_anti');
var $previous_anti = $('#previous_anti');
var $anti_tbody = $('#anti_tbody');
var $anti_search = $('#anti_search');
$anti_search.on('click', function () {
    var data = {};
    var neckname = $('#anti_neckname_search').val();
    var platform = $('#anti_platform_search').val();
    var start_time = $('#anti_start_uptime').val();
    var end_time = $('#anti_end_uptime').val();
    var uid = $('#anti_uid_search').val();
    var reason = $('#anti_reason_search').val();
    start_time = Date.parse(start_time).toString();
    start_time = start_time.substr(0,start_time.length-3);
    end_time = Date.parse(end_time).toString();
    end_time = end_time.substr(0,end_time.length-3);
    if (neckname.length !== 0) { data['neckname'] = neckname }
    if (platform.length !== 0) { data['platform'] = platform }
    if (start_time.length !== 0) { data['start_time'] = start_time }
    if (end_time.length !== 0) { data['end_time'] = end_time }
    if (uid.length !== 0) { data['uid'] = uid }
    if (reason.length !== 0) { data['reason'] = reason }
    $.getJSON('/api/anti_fans/list', data).done(function (data) {
        if (data['success'] === 1) {
            anti_page = 0;
            var text = '';
            var i, len;
            anti_list = data['data'];
            for (i in anti_list) {
                anti_dict[anti_list[i]['_id']] = anti_list[i]
            }
            if (anti_list.length >= anti_len) {
                len = anti_len;
                $next_anti.removeClass('disabled');
                $next_anti_a.attr('disabled', false);
                $next_anti_a.css("pointer-events", "auto");
            } else {
                len = anti_list.length;
                $next_anti.addClass('disabled');
                $next_anti_a.attr('disabled', true);
                $next_anti_a.css("pointer-events", "none");
            }
            for (i = 0; i < len; i++) {
                text = text +
                    '<tr><td>' + anti_list[i]['neckname'] +
                    '</td><td>' + anti_list[i]['platform'] +
                    '</td><td>' + anti_list[i]['uid'] +
                    '</td><td>' + anti_list[i]['uptime'] +
                    '</td><td>' + anti_list[i]['reason'] +
                    '</td><td><button class="btn btn-default" id="anti_detail_btn" value=' +
                    anti_list[i]['_id'] + '>&larr; 详情</button></td></tr>';
            }
            $anti_tbody.html(text);
            anti_max = Math.ceil(anti_list.length / anti_len) - 1;
        } else {
            fetch_failed(data)();
        }
    })
});
$previous_anti_a.on('click', function () {
    if (anti_page !== 0) {
        anti_page--;
        var i, text = '';
        var i_max;
        if ((anti_page + 1) * anti_len > anti_list.length) {
            i_max = anti_list.length
        } else {
            i_max = (anti_page + 1) * anti_len
        }
        for (i = anti_page * anti_len; i < i_max; i++) {
            text = text +
                '<tr><td>' + anti_list[i]['neckname'] +
                '</td><td>' + anti_list[i]['platform'] +
                '</td><td>' + anti_list[i]['uid'] +
                '</td><td>' + anti_list[i]['uptime'] +
                '</td><td>' + anti_list[i]['reason'] +
                '</td><td><button class="btn btn-default" id="anti_detail_btn" value=' +
                anti_list[i]['_id'] + '>&larr; 详情</button></td></tr>';
        }
        if (anti_page === 0) {
            $previous_anti.addClass('disabled');
            $previous_anti_a.attr('disabled', true);
            $previous_anti_a.css("pointer-events", "none");
        }
        $next_anti.removeClass('disabled');
        $next_anti_a.attr('disabled', false);
        $next_anti_a.css("pointer-events", "auto");
        $anti_tbody.html(text);
    }
});
$next_anti_a.on('click', function () {
    if (anti_page !== anti_max) {
        anti_page++;
        var i, text = '';
        var i_max;
        if ((anti_page + 1) * anti_len > anti_list.length) {
            i_max = anti_list.length
        } else {
            i_max = (anti_page + 1) * anti_len
        }
        for (i = anti_page * anti_len; i < i_max; i++) {
            text = text +
                '<tr><td>' + anti_list[i]['neckname'] +
                '</td><td>' + anti_list[i]['platform'] +
                '</td><td>' + anti_list[i]['uid'] +
                '</td><td>' + anti_list[i]['uptime'] +
                '</td><td>' + anti_list[i]['reason'] +
                '</td><td><button class="btn btn-default" id="anti_detail_btn" value=' +
                anti_list[i]['_id'] + '>&larr; 详情</button></td></tr>';
        }
        if (anti_page === anti_max) {
            $next_anti.addClass('disabled');
            $next_anti_a.attr('disabled', true);
            $next_anti_a.css("pointer-events", "none");
        }
        $previous_anti.removeClass('disabled');
        $previous_anti_a.attr('disabled', false);
        $previous_anti_a.css("pointer-events", "auto");
        $anti_tbody.html(text);
    }
});
$anti_tbody.on('click', 'tr td button', anti_detail);
var anti_evidence_c = {};
var $anti_evidence_c = $('#anti_evidence_c');
var $anti_platform_c = $('#anti_platform_c');
var $anti_neckname_c = $('#anti_neckname_c');
var $anti_uid_c = $('#anti_uid_c');
var $anti_uptime_c = $('#anti_uptime_c');
var $anti_reason_c = $('#anti_reason_c');
var $anti_id_c = $('#anti_id_c');
function anti_detail() {
    var this_ = $(this);
    var _id = this_.val();
    var anti_data = anti_dict[_id];
    $anti_id_c.val(_id);
    $anti_platform_c.val(anti_data['platform']);
    $anti_neckname_c.val(anti_data['neckname']);
    $anti_uptime_c.val(anti_data['uptime']);
    $anti_uid_c.val(anti_data['uid']);
    $anti_reason_c.val(anti_data['reason']);
    var i, text = '';
    for (i = 0; i < anti_data['evidence'].length; i++) {
        anti_evidence_c[anti_data['evidence'][i]['img']] = 1;
        text += '<tr><td><img src="' + anti_data['evidence'][i]['address'] +
            '" height="50px" alt="123"/></td><td style="text-align:right">' +
            '<button class="btn btn-default" id="delete_evidence_btn" value=' +
            anti_data['evidence'][i]['img'] + '>&larr; 删除</button></td></tr>';
    }
    $anti_evidence_c.html(text);
    $('.docker').hide();
    $('#antifan-c').show();
}
$('#anti_file_btn_c').on('click', function () {
    var fileObj = $(".anti_img_input_c")[0].files[0];
    if (fileObj === undefined) { return }
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
            $('.antifan_img_c').attr('src', data['data']['address']);
            anti_evidence_c[data['data']['img']] = 1;
            var text = $anti_evidence_c.html();
            text += '<tr><td><img src="' + data['data']['address'] + '" height="50px" alt="123"/></td><td style="text-align:right">' +
                '<button class="btn btn-default" id="delete_evidence_btn" value=' +
                    data['data']['img'] + '>&larr; 删除</button></td></tr>';
            $anti_evidence_c.html(text);
        }else{
            alert('操作失败，失败信息：' + data['msg']);
        }
    });
});
$anti_evidence_c.on('click', 'tr td button', delete_evidence_c);
function delete_evidence_c() {
    var this_ = $(this);
    var evidence = this_.val();
    anti_evidence_c[evidence] = 0;
    this_.parent('td').parent('tr').html('');
}
$('#anti_input_btn_c').on('click', function () {
    var platform = $anti_platform_c.val();
    var neckname = $anti_neckname_c.val();
    var uptime = $anti_uptime_c.val();
    uptime = Date.parse(uptime).toString();
    uptime = uptime.substr(0,uptime.length-3);
    var evidence_list = [];
    for (var key in anti_evidence_c) {
        if(anti_evidence_c[key] === 1) {
            evidence_list.push(key);
        }
    }
    var evidence = evidence_list.join(',');
    var anti_data = {
        'op': 2,
        'platform': platform,
        'neckname': neckname,
        'uid': $anti_uid_c.val(),
        'uptime': uptime,
        'reason': $anti_reason_c.val(),
        'evidence': evidence,
        'id': $anti_id_c.val(),
    };
    anti_data = JSON.stringify(anti_data);
    if ((platform.length !== 0) && (neckname.length !== 0)){
        $.ajax('/api/anti_fans/merge', {
            'method': 'POST',
            'contentType': 'application/json',
            'data': anti_data,
            'dataType': 'json'
        }).done(function (data) {
            if (data['success'] === 1) {
                alert('修改成功');
                $anti_search.click();
                $('.docker').hide();
                $('#antifan-b').show();
            }else{
                alert('操作失败，失败信息：' + data['msg']);
            }
        })
    }
});
$('#anti_back_btn').on('click', function () {
    $('.docker').hide();
    $('#antifan-b').show();
});
