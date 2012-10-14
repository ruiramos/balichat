class Document < ActiveRecord::Base
  attr_accessible :filename, :chatroom, :remote_url

  before_create :save_remote_url

  def save_remote_url
    self.remote_url = "uploads/#{SecureRandom.uuid}/#{self.filename}"
  end
end