#require 'xmpp4r'
#require 'xmpp4r/muc'
#
#Jabber::debug = true
#
#client = Jabber::Component.new(Jabber::JID.new("concierge.aeronave.local"))
#
##client = Jabber::Client.new("concierge@aeronave.local")
#
##client.connect "aeronave.local"
#client.connect "aeronave.local", 8888
#
#client.auth "secret"
##client.start
#
#muc = Jabber::MUC::MUCClient.new(client)
#
#muc.add_message_callback do |time, nick, text|
#  "#{time} - #{nick} - #{text}"
#end
#
#muc.join("cenas@conference.aeronave.local/concierge")
#
##loop { sleep 1 }
#
#loop do
#  sleep 1
#end

require Rails.root.join('vendor','gems','tp-blather-0.8.5','lib','blather','client','client')
$stdout.sync = true

EM.run do
  client = Blather::Client.setup 'concierge.aeronave.local', 'secret', 'aeronave.local', 8888

  #client = Blather::Client.setup 'concierge@aeronave.local', 'secret'

  client.register_handler(:ready) do
    puts "Connected ! send messages to #{client.jid.stripped}."

    #pres = Blather::Stanza::Presence::Status.new
    #pres.to = "cenas@conference.aeronave.local/concierge"
    #pres.state = :available
    #
    #client.write(pres)

    join = Blather::Stanza::Presence::MUC.new
    join.to = "cenas@conference.aeronave.local/concierge"
    client.write join
  end

  client.register_handler :subscription, :request? do |s|
    puts "GOT SUB REQ: #{s.inspect}"
    client.write s.approve!
  end

  client.register_handler :message, :groupchat?, :body do |m|
    puts "GOT groupchat: #{m.inspect}"
    client.write Blather::Stanza::Message.new(m.from, "GOT THAT: #{m.body}")
  end

  client.register_handler :message, :chat?, :body do |m|
    puts "GOT chat: #{m.inspect}"
    client.write Blather::Stanza::Message.new(m.from, "GOT THAT: #{m.body}")
  end

  client.run
end
#
#
#
#


#require 'blather/client/dsl'
#$stdout.sync = true

#module Concierge
#  extend Blather::DSL
#  def self.run; client.run; end
#
#  setup 'concierge.aeronave.local', 'secret', 'aeronave.local', 8888
#
#  when_ready do
#    join("cenas", "conference.aeronave.local", "concierge")
#    #pres = Blather::Stanza::Presence::Status.new
#    #pres.to = "cenas@conference.aeronave.local/concierge"
#    #pres.state = :chat
#    #
#    #client.write(pres)
#  end
#
#  presence proc { |s| puts "GOT PRESENCE: #{s.inspect}" }
#
#  message :groupchat? do |m|
#    puts "GOT groupchat: #{m.inspect}"
#    #say m.from, "You sent: #{m.body}"
#  end
#end
#
#trap(:INT) { EM.stop }
#trap(:TERM) { EM.stop }
#EM.run do
#  Concierge.run
#end

#setup 'concierge.aeronave.local', 'secret', 'aeronave.local', 8888
#
#when_ready do
#  puts "Connected ! send messages to #{jid.stripped}."
#
#  puts "joining..."
#
#  pres = Blather::Stanza::Presence::Status.new
#  pres.to = "cenas@conference.aeronave.local/concierge"
#  pres.state = :chat
#
#  client.write(pres)
#end
#
##presence proc { |s| puts "GOT PRESENCE: #{s.inspect}" }
#
#status proc { |s| puts "GOT STATUS: #{s.inspect}" }
#
#subscription :request? do |s|
#  puts "GOT SUB REQ: #{s.inspect}"
#  write_to_stream s.approve!
#end
#
#message proc { |m| puts "GOT MESSAGE: #{m.inspect}" }

#status :away? do |s|
#  puts "GOT STATUS away: #{s.inspect}"
#end
#
#status :chat? do |s|
#  puts "GOT STATUS chat: #{s.inspect}"
#end
#
#status :dnd? do |s|
#  puts "GOT STATUS dnd: #{s.inspect}"
#end
#
#status :xa? do |s|
#  puts "GOT STATUS xa: #{s.inspect}"
#end

#presence :unavailable? do |s|
#  puts "GOT PRESENCE unavailable: #{s.inspect}"
#end

#message :chat? do |m|
#  puts "GOT chat: #{m.inspect}"
#  #say m.from, "You sent: #{m.body}"
#end
#
#message :groupchat? do |m|
#  puts "GOT groupchat: #{m.inspect}"
#  #say m.from, "You sent: #{m.body}"
#end
#
#message :error? do |m|
#  puts "GOT error: #{m.inspect}"
#  #say m.from, "You sent: #{m.body}"
#end
#
#message :headline? do |m|
#  puts "GOT headline: #{m.inspect}"
#  #say m.from, "You sent: #{m.body}"
#end
#
#message :normal? do |m|
#  puts "GOT normal: #{m.inspect}"
#  #say m.from, "You sent: #{m.body}"
#end


#trap(:INT) { EM.stop }
#trap(:TERM) { EM.stop }
#EM.run do
#  #Blather::Stream::Client.start(Class.new {
#  #  attr_accessor :jid
##
#  #  def post_init(stream, jid = nil)
#  #    @stream = stream
#  #    self.jid = jid
##
#  #    @stream.send_data Blather::Stanza::Presence::Status.new
#  #    puts "Stream started!"
#  #  end
##
#  #  def receive_data(stanza)
#  #    @stream.send_data stanza.reply!
#  #  end
##
#  #  def unbind
#  #    puts "Stream ended!"
#  #  end
#  #}.new, 'concierge.aeronave.local', 'secret', 'aeronave.local')
#end

#when_ready { puts "Connected ! send messages." }
#
#subscription :request? do |s|
#  puts "omg, subscription"
#  write_to_stream s.approve!
#end
#
#message :chat?, :body do |m|
#  puts "omg: #{m}"
#end
#
#status :from => Blather::JID.new('echo@jabber.local/pong') do |s|
#  puts "serve!"
#  say s.from, 'ping'
#end

#trap(:INT) { EM.stop }
#trap(:TERM) { EM.stop }
#EM.run do
#
#  client = Blather::Client.setup 'concierge.aeronave.local', 'secret', 'aeronave.local', 8888
#
#  client.register_handler(:ready) do
#    puts "Connected ! send messages to #{client.jid.stripped}."
#  end
#
#  client.register_handler :subscription, :request? do |s|
#    puts "GOT subscription"
#    client.write s.approve!
#  end
#
#  client.register_handler :message, :chat?, :body => 'exit' do |m|
#    puts "GOT message exit"
#    client.write Blather::Stanza::Message.new(m.from, 'Exiting...')
#    client.close
#  end
#
#  client.register_handler :message do |m|
#    puts "GOT message: #{m}"
#    client.write Blather::Stanza::Message.new(m.from, "You sent: #{m.body}")
#  end
#
#  client.run
#  client.start
#
#end
###