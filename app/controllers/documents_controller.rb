class DocumentsController < ApplicationController

  def create
    @document = Document.create(params[:doc])
    #render :json => {
    #  :policy => s3_upload_policy_document,
    #  :signature => s3_upload_signature,
    #  :key => @document.s3_key,
    #  :success_action_redirect => document_upload_success_document_url(@document)
    #}

    render json: {
      policy: s3_upload_policy_document,
      signature: s3_upload_signature,
      key: @document.remote_url,
      success_action_redirect: "/"
    }
  end

  def s3_confirm
    head :ok
  end

  private

  # generate the policy document that amazon is expecting.
  def s3_upload_policy_document
    Base64.encode64(
      {
        expiration: 30.minutes.from_now.utc.strftime('%Y-%m-%dT%H:%M:%S.000Z'),
        conditions: [
          { bucket: UPLOADS[:bucket] },
          { acl: 'public-read' },
          ["starts-with", "$key", "uploads/"],
          { success_action_status: '201' }
        ]
      }.to_json
    ).gsub(/\n|\r/, '')
  end

  # sign our request by Base64 encoding the policy document.
  def s3_upload_signature
    Base64.encode64(
      OpenSSL::HMAC.digest(
        OpenSSL::Digest::Digest.new('sha1'),
        UPLOADS[:aws_secret],
        s3_upload_policy_document
      )
    ).gsub(/\n/, '')
  end

end