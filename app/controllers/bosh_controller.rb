require 'xmpp4r/httpbinding/client'

class BoshController < ApplicationController
  def connect
    @client = Jabber::HTTPBinding::Client.new('rikas@localhost')
    @client.connect('http://localhost:5280/http-bind')
    @client.auth('baliman')

    sid = @client.instance_variable_get('@http_sid')
    rid = @client.instance_variable_get('@http_rid')

    render text: "SID: #{sid} RID: #{rid}"
  end
end