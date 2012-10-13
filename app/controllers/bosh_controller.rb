class BoshController < ApplicationController
  def test
    @jid, @sid, @rid =
      RubyBOSH.initialize_session("teste@localhost/web", "baliman", "http://localhost:5280/http-bind")
  end
end