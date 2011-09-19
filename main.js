
function handle(ev, handler) {
    $(document).bind(ev, handler);
}

$(document).ready(function () {
    UI.init(); 
    UI.st_login();
    
    //$(document).trigger("login_action", { 'login' : 'tema@localhost', 'password' : '123456' });
});

handle("login_action", function (ev, creds) {
    UI.st_login_connecting();
    Xmpp.connect({
        'jid': creds.login + '@localhost',
        'password': creds.password
    });
});

handle("connection_failed", function (ev, data) {
    UI.st_login({
        'message': data.error
    });
});

handle("connected", function () {
    UI.st_roster();
    Xmpp.request_friends();
});

handle('disconnected', function () {
    UI.st_login({ error: "disconnected" });
});

handle('friends_recieved', function (ev, data) {
    console.log(ev.type, data);
    Roster.update_roster_list(data);
    Xmpp.send_presence();
});

handle("roster_item_action", function(ev, data) {
    console.log(ev.type, data);
    var status = Roster.get_item_status(data.jid);
    if (status == 'none') {
        Roster.set_item_status(data.jid, 'invited');
        Xmpp.send_invite({ 'jid': data.jid });
    }
    else if (status == 'invited') {
        console.log('revoke_inv');
        Roster.set_item_status(data.jid, 'none');
        Xmpp.send_revoke_invitation({ 'jid': data.jid });
    }
    else if (status == 'inviting') {
        Roster.set_item_status(data.jid, 'none');
        UI.st_chat();
        //Xmpp.chat({ 'jid': data.jid });
    }
});

handle('invitation_recieved', function (ev, data) {
    console.log(ev.type, data);
    if (Roster.get_item_status(data.jid) == 'invited') {
        Roster.get_item_status(data.jid, 'none');
        UI.st_chat();
        //Xmpp.chat({ 'jid': data.jid });
    } else {
        Roster.set_item_status(data.jid, 'inviting');
    }
});

handle('invitation_revoked', function (ev, data) {
    console.log(ev.type, data);
    if (Roster.get_item_status(data.jid) == 'inviting') {
        Roster.set_item_status(data.jid, 'none');
    }
});

handle('friend_online', function (ev, data) {
    console.log(ev.type, data);
    //UI.update_roster();
});

handle('friend_offline', function (ev, data) {
    console.log(ev.type, data);
    //UI.update_roster();
});

handle('taps_recieved', function (ev, data) {
    console.log(ev.type, data);
});

handle("taptap_action", function(ev, data) {
    Xmpp.send_taps(data);
});

handle.bind("quit_chat_action", function () {
    Xmpp.send_message({
        'jid': jid,
        'body': 'good bye'
    });
});

