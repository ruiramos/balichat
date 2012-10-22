class BoshController < ApplicationController
  before_filter :authenticate_user!

  def test
    username = "#{current_user.jid}@#{JABBER[:host]}/web"
    begin
      @jid, @sid, @rid = RubyBOSH.initialize_session(username, current_user.jabber_password, "http://#{JABBER[:host]}:5280/http-bind")
    rescue
      Rails.logger.info "Error while logging user (jid: #{username}, pass: #{current_user.jabber_password})"
    end
  end
end