//logging
var logging_list = [];
var logging_dict = {};
var logging_page = 0;
var logging_max = 0;
var logging_len = 12;
var $next_logging_a = $('#next-logging-a');
var $previous_logging_a = $('#previous-logging-a');
$('#logging-btn').on('click', function () {
    var data = {};
    var operation = $('#logging-operation').val();
    var target = $('#logging-target').val();
    var start_time = $('#logging-start-time').val();
    var end_time = $('#logging-end-time').val();
    var user = $('#logging-user').val();
    start_time = Date.parse(start_time).toString();
    start_time = start_time.substr(0,start_time.length-3);
    end_time = Date.parse(end_time).toString();
    end_time = end_time.substr(0,end_time.length-3);
    if (operation.length !== 0) { data['operation'] = operation }
    if (target.length !== 0) { data['target'] = target }
    if (start_time.length !== 0) { data['start_time'] = start_time }
    if (end_time.length !== 0) { data['end_time'] = end_time }
    if (user.length !== 0) { data['user'] = user }
    $.getJSON('/api/fetch_logging', data).done(function (data) {
        if (data['success'] === 1) {
            logging_page = 0;
            var text = '';
            var i, len;
            logging_list = data['data'];
            for (i in logging_list) {
                logging_dict[logging_list[i]['_id']] = logging_list[i]
            }
            if (logging_list.length >= logging_len) {
                len = logging_len;
                $('#next-logging').removeClass('disabled');
                $next_logging_a.attr('disabled', false);
                $next_logging_a.css("pointer-events", "auto");
            } else {
                len = logging_list.length;
                $('#next-logging').addClass('disabled');
                $next_logging_a.attr('disabled', true);
                $next_logging_a.css("pointer-events", "none");
            }
            for (i = 0; i < len; i++) {
                text = text +
                    '<tr><td>' + logging_list[i]['user'] +
                    '</td><td>' + logging_list[i]['operation'] +
                    '</td><td>' + logging_list[i]['target'] +
                    '</td><td>' + logging_list[i]['ip'] +
                    '</td><td>' + logging_list[i]['time'] + '</td></tr>';
            }
            $('#logging-tbody').html(text);
            logging_max = Math.ceil(logging_list.length / logging_len) - 1;
        } else {
            fetch_failed(data)();
        }
    })
});
$previous_logging_a.on('click', function () {
    if (logging_page !== 0) {
        logging_page--;
        var i, text = '';
        var i_max;
        if ((logging_page + 1) * logging_len > logging_list.length) {
            i_max = logging_list.length
        } else {
            i_max = (logging_page + 1) * logging_len
        }
        for (i = logging_page * logging_len; i < i_max; i++) {
            text = text +
                '<tr><td>' + logging_list[i]['user'] +
                '</td><td>' + logging_list[i]['operation'] +
                '</td><td>' + logging_list[i]['target'] +
                '</td><td>' + logging_list[i]['ip'] +
                '</td><td>' + logging_list[i]['time'] + '</td></tr>'
        }
        if (logging_page === 0) {
            $('#previous-logging').addClass('disabled');
            $previous_logging_a.attr('disabled', true);
            $previous_logging_a.css("pointer-events", "none");
        }
        $('#next-logging').removeClass('disabled');
        $next_logging_a.attr('disabled', false);
        $next_logging_a.css("pointer-events", "auto");
        $('#logging-tbody').html(text);
    }
});
$next_logging_a.on('click', function () {
    if (logging_page !== logging_max) {
        logging_page++;
        var i, text = '';
        var i_max;
        if ((logging_page + 1) * logging_len > logging_list.length) {
            i_max = logging_list.length
        } else {
            i_max = (logging_page + 1) * logging_len
        }
        for (i = logging_page * logging_len; i < i_max; i++) {
            text = text +
                '<tr><td>' + logging_list[i]['user'] +
                '</td><td>' + logging_list[i]['operation'] +
                '</td><td>' + logging_list[i]['target'] +
                '</td><td>' + logging_list[i]['ip'] +
                '</td><td>' + logging_list[i]['time'] + '</td></tr>'
        }
        if (logging_page === logging_max) {
            $('#next-logging').addClass('disabled');
            $next_logging_a.attr('disabled', true);
            $next_logging_a.css("pointer-events", "none");
        }
        $('#previous-logging').removeClass('disabled');
        $previous_logging_a.attr('disabled', false);
        $previous_logging_a.css("pointer-events", "auto");
        $('#logging-tbody').html(text);
    }
});