class CreateDocuments < ActiveRecord::Migration
  def change
    create_table :documents do |t|
      t.string :filename
      t.string :remote_url
      t.string :chatroom

      t.timestamps
    end
  end
end
