class AddTokenToUser < ActiveRecord::Migration
  def change
    add_column :users, :authentication_token, :string
    add_index :users, :authentication_token, :unique => true

    for user in User.all
      user.ensure_authentication_token
      user.save!
    end
  end
end
