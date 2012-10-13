class ChatsController < ApplicationController
  before_filter :authenticate_user!

  # lists all the chats for this company
  def index

  end

  # shows this chatroom
  def show

  end
end
