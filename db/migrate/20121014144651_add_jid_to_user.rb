class AddJidToUser < ActiveRecord::Migration
  def change
    add_column :users, :jid, :string, null: false, default: ""
  end
end
