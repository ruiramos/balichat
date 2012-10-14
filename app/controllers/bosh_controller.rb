class BoshController < ApplicationController
  before_filter :authenticate_user!

  def test
    @jid, @sid, @rid = RubyBOSH.initialize_session("#{current_user.jid}@#{JABBER[:host]}/web", "#{current_user.jabber_password}", "http://#{JABBER[:host]}:5280/http-bind")
  end
end