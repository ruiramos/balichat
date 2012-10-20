require 'digest/sha1'

class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :lockable, :timeoutable, :omniauthable, :confirmable
  devise :database_authenticatable, :registerable, :token_authenticatable,
         :recoverable, :rememberable, :trackable, :validatable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me, :name

  before_create :generate_jid
  after_create :create_user_on_ejabberd
  before_save :ensure_authentication_token

  def jabber_password
    self.authentication_token[-6..-1]
  end

  def to_s
    self.name || self.email
  end

  private

  def generate_jid
    user_from_email = self.email.split("@").first
    hashed_email = Digest::SHA1.hexdigest "bali$chat-#{self.email}"
    self.jid = "#{user_from_email}_#{hashed_email[-6..-1]}"
  end

  def create_user_on_ejabberd
    output = `#{JABBER[:ejabberdctl]} register #{self.jid} #{JABBER[:host]} #{self.jabber_password}`

    if output =~ /successfully registered/
      return true
    else
      raise "Error registering user (#{command})"
    end
  end

end
