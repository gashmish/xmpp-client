var Xmpp = {
    bosh_server_url: 'http://localhost:5280/xmpp-httpbind',
    connection: null,

    connect: function (creds) {
        var conn = new Strophe.Connection(Xmpp.bosh_server_url);
        
        conn.rawInput = function (data) {
            console.log(data);
        };

        conn.rawOutput = function (data) {
            console.log(data);
        };

        conn.connect(creds.jid, creds.password, function (status) {
            if (status === Strophe.Status.CONNECTED) {
                Xmpp.init_handlers();
                $(document).trigger('connected');
            }
            else if (status === Strophe.Status.DISCONNECTED) {
                $(document).trigger('disconnected');
            } 
            else if (status === Strophe.Status.CONNFAIL) {
                $(document).trigger('connection_failed', {
                    'error': 'conn_fail'
                });
            }
            else if (status === Strophe.Status.AUTHFAIL) {
                $(document).trigger('connection_failed', {
                    'error': 'auth_failed'
                });
            }
        });

        Xmpp.connection = conn;
    },
        
    disconnect: function () {
        Xmpp.connection.disconnect();
        Xmpp.connection = null;
    },

    init_handlers: function() {

        // Handle incoming messages
        Xmpp.connection.addHandler(
           function (message) {
                var full_jid = $(message).attr('from');
                var jid = Strophe.getBareJidFromJid(full_jid);

                console.log(message);

                if ($(message).find('taps').length > 0) {
                    var taps = [];
                    $(message).find('taps > tap').each(function() {
                        taps.push({
                            timestamp: $(this).attr('timestamp'),
                            value: $(this).attr('value')
                        });
                    });
                    $(document).trigger('taps_recieved', {
                        'jid': jid,
                        'taps': taps
                    }); 
                }
                else if ($(message).find('invite')) {
                    console.log('invite');
                    $(document).trigger('invitation_recieved', {
                        'jid': jid
                    }); 
                }
                else if ($(message).find('revoke_invitation')) {
                    console.log('revoke_invitation');
                    $(document).trigger('invitation_revoked', {
                        'jid': jid
                    }); 
                }
            },
            null, 'message');

        // Handle presence events
        Xmpp.connection.addHandler(
            function (presence) {
                var type = $(presence).attr('type');
                var full_jid = $(presence).attr('from');
                var jid = Strophe.getBareJidFromJid(full_jid);

                if (type == null) {
                     $(document).trigger('friend_online', {
                        'jid': jid
                     });
                }
                else if (type === 'unavailable') {
                     $(document).trigger('friend_offline', {
                        'jid': jid
                     });
                }
            },
            null, 'presence');
    },

    send_taps: function (data) {
        var message = $msg({ 'to': data.jid }).c('taps');
        data.taps.forEach(function (tap) {
            message.c('tap').attrs({
                'timestamp': tap.timestamp,
                'value': tap.value
            }).up();
        });

        Xmpp.connection.send(message);
    },

    send_invite: function (data) {
        Xmpp.connection.send(
            $msg({ 'to': data.jid })
                .c('invite'));
    },

    send_revoke_invitation: function (data) {
        Xmpp.connection.send(
            $msg({ 'to': data.jid })
                .c('revoke_invitation'));
    },

    send_presence: function() {
        Xmpp.connection.send($pres());
    },

    request_friends: function () {
        var iq = $iq({type: 'get'})
            .c('query', {xmlns: 'jabber:iq:roster'});
        
        Xmpp.connection.sendIQ(iq, function (iq) {
            var friends = [];
            $(iq).find('item').each(function () {
                friends.push({
                    jid : $(this).attr('jid'),
                    name : $(this).attr('name') || jid
                });
            });
            $(document).trigger('friends_recieved', {
                'friends': friends
            }); 
        });
    }

    /*
    add_contact: function (data) {
        var iq = $iq({type: "set"})
            .c("query", {xmlns: "jabber:iq:roster"})
            .c("item", data);
        Xmpp.connection.sendIQ(iq);
        
        var subscribe = $pres({to: data.jid, "type": "subscribe"});
        Xmpp.connection.send(subscribe);
    },

    approve_subscription: function (jid) {
        Xmpp.connection.send($pres({
            'to': jid,
            "type": "subscribed"}));

        Xmpp.connection.send($pres({
            to: jid,
            "type": "subscribe"}));
    },

    deny_subsription: function (jid) {
        Xmpp.connection.send($pres({
            to: jid,
            "type": "unsubscribed"}));
    }
    */
};
