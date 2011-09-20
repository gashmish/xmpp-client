Roster = {
    jid_to_id: function (jid) {
        return Strophe.getBareJidFromJid(jid)
           .replace("@", "_")
           .replace(".", "-");
    },

    id_to_jid: function (id) {
        return id 
           .replace("_", "@")
           .replace("-", ".");
    },

    update_roster_list: function (data) {
      
        function onListItemClick (item) {
            var id = item.attr('id');
            $(document).trigger("roster_item_action", {
                jid: Roster.id_to_jid(id)
            });
        };  
                       
        data.friends.forEach(function (contact) {
            var jid_id = Roster.jid_to_id(contact.jid);
            var elem = $("<li id='" + jid_id + "'>" +
                contact.name + "<span class='ui-li-count'></span></li>");

            $('#friends_list').append(elem);
            
            $('#' + jid_id).click(function () {
                onListItemClick($(this));
            });

            Roster.set_item_status(contact.jid, 'none');
        });

        $('#friends_list').listview('refresh');
    },
    
    get_item_status: function (jid) {
        return $('#' + Roster.jid_to_id(jid)).attr('status');
    },

    set_item_status: function (jid, status) {
        var item = $('#' + Roster.jid_to_id(jid));
        item.attr('status', status);
        $('#' + Roster.jid_to_id(jid) + ' span').text(status);
    }
};

UI = {
    init: function () {
        $('#login_button').click(function () {
            var creds = {
                login: $('#login').val(),
                password: $('#password').val()
            };

            if ($('#login').val() == "") {
                $('#login').focus();
                return;
            } else if ($('#password').val() == "") {
                $('#password').focus();
                return;
            }
            $(document).trigger("login_action", creds);
        });

        $('#quit_chat_button').click(function () {
            $(document).trigger("quit_chat_action");
        });

        $('#tap_button').click(function () {
            $(document).trigger("taptap_action");
        });
    },

    st_login: function(data) {
        $('#password').val('');
        $('#login, #password').textinput('enable');
        $('#login_button').button('enable');
        $('#message_label').text(data && data.message || "");
    },
   
    st_login_connecting: function () {
        $('#login, #password').textinput('disable');
        $('#login_button').button('disable');
        $('#message_label').text("Connecting...");
    },

    st_roster: function () {
        $.mobile.changePage($('#roster_page'));
    },

    st_chat: function (data) {
        $.mobile.changePage($('#chat_page'));
    }
};
