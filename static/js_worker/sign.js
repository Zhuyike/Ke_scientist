//sign-up
var sign_list = [];
var sign_dict = {};
var sign_page = 0;
var sign_max = 0;
var sign_len = 12;
$('#sign-search-btn').on('click', function () {
    $.getJSON('/api/fetch_sign', {}).done(function (data) {
        if (data['success'] === 1) {
            sign_page = 0;
            var text = '';
            var i, len;
            sign_list = data['data'];
            for (i in sign_list) {
                sign_dict[sign_list[i]['_id']] = sign_list[i]
            }
            if (sign_list.length >= sign_len) {
                len = sign_len;
                $('#next-sign').removeClass('disabled');
            } else {
                len = sign_list.length;
                $('#next-sign').addClass('disabled');
            }
            for (i = 0; i < len; i++) {
                text = text +
                    '<tr><td>' + sign_list[i]['name'] +
                    '</td><td>' + sign_list[i]['time'] +
                    '</td><td><button class="btn btn-default" id="sign-pass-btn" value=' + sign_list[i]['_id'] +
                    '>通过</button>&nbsp;<button class="btn btn-default" id="sign-reject-btn" value=' +
                    sign_list[i]['_id'] + '>拒绝</button></td></tr>';
            }
            $('#sign-tbody').html(text);
            $('#sign-reject-btn').removeAttr('disabled');
            sign_max = Math.ceil(sign_list.length / sign_len) - 1;
        } else {
            fetch_failed(data)()
        }
    })
});
$('#previous-sign-a').on('click', function () {
    if (sign_page !== 0) {
        sign_page--;
        var i, text = '';
        var i_max;
        if ((sign_page + 1) * sign_len > sign_list.length) {
            i_max = sign_list.length
        } else {
            i_max = (sign_page + 1) * sign_len
        }
        for (i = sign_page * sign_len; i < i_max; i++) {
            text = text +
                '<tr><td>' + sign_list[i]['name'] +
                '</td><td>' + sign_list[i]['time'] +
                '</td><td><button class="btn btn-default" id="sign-pass-btn" value=' + sign_list[i]['_id'] +
                '>通过</button>&nbsp;<button class="btn btn-default" id="sign-reject-btn" value=' +
                sign_list[i]['_id'] + '>拒绝</button></td></tr>';
        }
        if (sign_page === 0) {
            $('#previous-sign').addClass('disabled');
        }
        $('#next-sign').removeClass('disabled');
        $('#sign-tbody').html(text);
    }
});
$('#next-sign-a').on('click', function () {
    if (sign_page !== sign_max) {
        sign_page++;
        var i, text = '';
        var i_max;
        if ((sign_page + 1) * sign_len > sign_list.length) {
            i_max = sign_list.length
        } else {
            i_max = (sign_page + 1) * sign_len
        }
        for (i = sign_page * sign_len; i < i_max; i++) {
            text = text +
                '<tr><td>' + sign_list[i]['name'] +
                '</td><td>' + sign_list[i]['time'] +
                '</td><td><button class="btn btn-default" id="sign-pass-btn" value=' + sign_list[i]['_id'] +
                '>通过</button>&nbsp;<button class="btn btn-default" id="sign-reject-btn" value=' +
                sign_list[i]['_id'] + '>拒绝</button></td></tr>';
        }
        if (sign_page === sign_max) {
            $('#next-sign').addClass('disabled');
        }
        $('#previous-sign').removeClass('disabled');
        $('#sign-tbody').html(text);
    }
});
$('#sign-reject-btn').on('click', function () {
    if (confirm('确定要全部拒绝么？')) {
        $.getJSON('/api/sign_reject_all', {}).done(function (data) {
            if (data['success'] === 1) {
                alert('已经全部拒绝');
                $('#sign-tbody').html('');
            } else {
                fetch_failed(data)()
            }
        })
    }
});
$('.sign').on('click', 'tbody tr td button', function () {
    var this_ = $(this);
    var target_url, confirm_msg;
    if (this_.attr('id') === 'sign-pass-btn'){
        target_url = '/api/sign_pass';
        confirm_msg = '确定通过该用户申请?';
    } else {
        target_url = '/api/sign_reject';
        confirm_msg = '确定拒绝该用户申请?';
    }
    if (confirm(confirm_msg)){
        $.getJSON(target_url, {
            '_id': this_.val()
        }).done(function (data) {
            if (data['success'] === 1) {
                alert('操作成功');
                this_.parent('td').parent('tr').html('')
            } else {
                fetch_failed(data)()
            }
        });
    }
});