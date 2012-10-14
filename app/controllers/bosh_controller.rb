class BoshController < ApplicationController
  def test
    @jid, @sid, @rid = RubyBOSH.initialize_session("teste@#{JABBER[:host]}/web", "omglol", "http://#{JABBER[:host]}:5280/http-bind")
  end
end