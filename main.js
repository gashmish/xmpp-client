
var chatmate;

function handle(ev, handler) {
    $(document).bind(ev, handler);
}

$(document).ready(function () {
    chatmate = null;

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
    //console.log(ev.type, data);
    Roster.update_roster_list(data);
    Xmpp.send_presence();
});

function start_chat(jid) {
    Roster.set_item_status(jid, 'none');
    UI.st_chat();
    chatmate = jid;
}

handle("roster_item_action", function(ev, data) {
    //console.log(ev.type, data);
    var status = Roster.get_item_status(data.jid);
    if (status == 'none') {
        Roster.set_item_status(data.jid, 'invited');
        Xmpp.send_invite({ 'jid': data.jid });
    }
    else if (status == 'invited') {
        //console.log('revoke_inv');
        Roster.set_item_status(data.jid, 'none');
        Xmpp.send_revoke_invitation({ 'jid': data.jid });
    }
    else if (status == 'inviting') {
        Xmpp.send_invite({ 'jid': data.jid });
       
        start_chat(data.jid); 
        //Roster.set_item_status(data.jid, 'none');
        //UI.st_chat();
        //chatmate = data.jid;

        /*
        Xmpp.send_invite({ 'jid': data.jid });
        Roster.set_item_status(data.jid, 'connecting');
        
        // Waiting for incoming chat request
        Xmpp.handle_chat_request(function (jid) {
            console.log('Check: ', data.jid, jid);
            Roster.set_item_status(data.jid, 'none');
            if (data.jid != jid) {
                return false; // i don't know you, go away
            } else {
                UI.st_chat();
                return true; // all right, let's chat 
            }
        });
        */
    }
});

handle('invitation_recieved', function (ev, data) {
    console.log(ev.type, data);
    if (Roster.get_item_status(data.jid) == 'invited') {
        
        start_chat(data.jid);
        //Roster.set_item_status(data.jid, 'none');
        //UI.st_chat();
        //chatmate = data.jid;
        
        /*
        Roster.set_item_status(data.jid, 'connecting');
        Xmpp.start_chat({ 'jid': data.jid }, function (er) {
            Roster.set_item_status(data.jid, 'none');
            if (!er) {
                UI.st_chat();
            } 
        });
        */
    } else {
        Roster.set_item_status(data.jid, 'inviting');
    }
});

handle('invitation_revoked', function (ev, data) {
    //console.log(ev.type, data);
    if (Roster.get_item_status(data.jid) == 'inviting') {
        Roster.set_item_status(data.jid, 'none');
    }
});

handle('friend_online', function (ev, data) {
    //console.log(ev.type, data);
    //UI.update_roster();
});

handle('friend_offline', function (ev, data) {
    //console.log(ev.type, data);
    //UI.update_roster();
});

handle('taps_recieved', function (ev, data) {
    console.log(ev.type, data);
    Chat.add_recieved_signal();
});

handle("taptap_action", function(ev, data) {
    Xmpp.send_taps({
        jid: chatmate,
        taps: [{ 'timestamp': 0, 'value': 0 }]
    });
});

handle("quit_chat_action", function () {
    Xmpp.send_quit_chat({ 'jid': chatmate });
    UI.st_roster();
    chatmate = null;

    /*
    Xmpp.send_message({
        'jid': jid,
        'body': 'good bye'
    });
    */
});

handle("chat_ended", function () {
    UI.st_roster();
    chatmate = null;
});

