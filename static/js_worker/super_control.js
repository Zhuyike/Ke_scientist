//super_control
var super_list = [];
var super_dict = {};
var super_page = 0;
var super_max = 0;
var super_len = 12;
var $next_super_a = $('#next-super-a');
var $previous_super_a = $('#previous-super-a');
var $next_super = $('#next-super');
var $previous_super = $('#previous-super');
var $super_tbody = $('#super-tbody');
$('#super-btn').on('click', function () {
    var data = {};
    var user = $('#super-text').val();
    if (user.length !== 0) { data['user'] = user }
    $.getJSON('/api/fetch_super_control', data).done(function (data) {
        if (data['success'] === 1) {
            super_page = 0;
            var text = '';
            var i, len;
            super_list = data['data'];
            for (i in super_list) {
                super_dict[super_list[i]['_id']] = super_list[i]
            }
            if (super_list.length >= super_len) {
                len = super_len;
                $next_super.removeClass('disabled');
                $next_super_a.attr('disabled', false);
                $next_super_a.css("pointer-events", "auto");
            } else {
                len = super_list.length;
                $next_super.addClass('disabled');
                $next_super_a.attr('disabled', true);
                $next_super_a.css("pointer-events", "none");
            }
            for (i = 0; i < len; i++) {
                text = text +
                    '<tr><td>' + super_list[i]['username'] +
                    '</td><td>' + super_list[i]['role'] +
                    '</td><td>' + super_list[i]['controls'] +
                    '</td><td>' + super_list[i]['time'] +
                    '</td><td><button class="btn btn-default" id="super_handle_btn" value=' + super_list[i]['id'] +
                    '>选中</button></td></tr>';
            }
            $super_tbody.html(text);
            super_max = Math.ceil(super_list.length / super_len) - 1;
        } else {
            fetch_failed(data)();
        }
    })
});
$previous_super_a.on('click', function () {
    if (super_page !== 0) {
        super_page--;
        var i, text = '';
        var i_max;
        if ((super_page + 1) * super_len > super_list.length) {
            i_max = super_list.length
        } else {
            i_max = (super_page + 1) * super_len
        }
        for (i = super_page * super_len; i < i_max; i++) {
            text = text +
                '<tr><td>' + super_list[i]['username'] +
                '</td><td>' + super_list[i]['role'] +
                '</td><td>' + super_list[i]['controls'] +
                '</td><td>' + super_list[i]['time'] +
                '</td><td><button class="btn btn-default" id="super_handle_btn" value=' + super_list[i]['id'] +
                '>选中</button></td></tr>';
        }
        if (super_page === 0) {
            $previous_super.addClass('disabled');
            $previous_super_a.attr('disabled', true);
            $previous_super_a.css("pointer-events", "none");
        }
        $next_super.removeClass('disabled');
        $next_super_a.attr('disabled', false);
        $next_super_a.css("pointer-events", "auto");
        $super_tbody.html(text);
    }
});
$next_super_a.on('click', function () {
    if (super_page !== super_max) {
        super_page++;
        var i, text = '';
        var i_max;
        if ((super_page + 1) * super_len > super_list.length) {
            i_max = super_list.length
        } else {
            i_max = (super_page + 1) * super_len
        }
        for (i = super_page * super_len; i < i_max; i++) {
            text = text +
                '<tr><td>' + super_list[i]['username'] +
                '</td><td>' + super_list[i]['role'] +
                '</td><td>' + super_list[i]['controls'] +
                '</td><td>' + super_list[i]['time'] +
                '</td><td><button class="btn btn-default" id="super_handle_btn" value=' + super_list[i]['id'] +
                '>选中</button></td></tr>';
        }
        if (super_page === super_max) {
            $next_super.addClass('disabled');
            $next_super_a.attr('disabled', true);
            $next_super_a.css("pointer-events", "none");
        }
        $previous_super.removeClass('disabled');
        $previous_super_a.attr('disabled', false);
        $previous_super_a.css("pointer-events", "auto");
        $super_tbody.html(text);
    }
});
var $super_control_username = $('#super_control-username');
var $super_tbody_b_disable = $('#super-tbody-b-disable');
var $super_tbody_b_enable = $('#super-tbody-b-enable');
$super_tbody.on('click', 'tr td button', function () {
    var this_ = $(this);
    $('.docker').hide();
    $('#super_control-b').show();
    $.getJSON('/api/fetch_user_super_control', {
        '_id': this_.val()
    }).done(function (data) {
        if (data['success'] === 1) {
            $super_control_username.val(data['data']['username']);
            var i;
            var disable_text = '';
            var disable_controls = data['data']['disable_controls'];
            for (i = 0; i < disable_controls.length; i++) {
                disable_text = disable_text +
                    '<tr><td>' + disable_controls[i]['name'] +
                    '</td><td style="text-align:right"><button class="btn btn-default" id="add_super_control_btn" value=' +
                    disable_controls[i]['id'] + '>添加 &rarr;</button></td></tr>';
            }
            $super_tbody_b_disable.html(disable_text);
            var enable_text = '';
            var enable_controls = data['data']['enable_controls'];
            for (i = 0; i < enable_controls.length; i++) {
                enable_text = enable_text +
                    '<tr><td><button class="btn btn-default" id="delete_super_control_btn" value=' +
                    enable_controls[i]['id'] + '>&larr; 删除</button></td><td style="text-align:right">' +
                    enable_controls[i]['name'] + '</td></tr>';
            }
            $super_tbody_b_enable.html(enable_text)
        } else {
            fetch_failed(data)()
        }
    });
});
$super_tbody_b_disable.on('click', 'tr td button', add_super_control);
$super_tbody_b_enable.on('click', 'tr td button', delete_super_control);
function add_super_control() {
    var this_ = $(this);
    $.getJSON('/api/add_user_super_control', {
        'id': this_.val(),
        'username': $super_control_username.val()
    }).done(function (data) {
        if (data['success'] === 1) {
            this_.parent('td').parent('tr').html('');
            var text = $super_tbody_b_enable.html();
            text += '<tr><td><button class="btn btn-default" id="delete_super_control_btn" value=' +
                    data['data']['id'] + '>&larr; 删除</button></td><td style="text-align:right">' +
                    data['data']['name'] + '</td></tr>';
            $super_tbody_b_enable.html(text);
        } else {
            fetch_failed(data)()
        }
    });
}
function delete_super_control() {
    var this_ = $(this);
    $.getJSON('/api/delete_user_super_control', {
        'id': this_.val(),
        'username': $super_control_username.val()
    }).done(function (data) {
        if (data['success'] === 1) {
            this_.parent('td').parent('tr').html('');
            var text = $super_tbody_b_disable.html();
            text += '<tr><td>' + data['data']['name'] +
                    '</td><td style="text-align:right"><button class="btn btn-default" id="add_super_control_btn" value=' +
                    data['data']['id'] + '>添加 &rarr;</button></td></tr>';
            $super_tbody_b_disable.html(text);
        } else {
            fetch_failed(data)()
        }
    });
}
$('#super_control-b_back-btn').on('click', function () {
    $('.docker').hide();
    $('#super_control').show();
});